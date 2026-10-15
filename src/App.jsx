import { useEffect, useState } from 'react'
import './App.css'

const API_URL =
  'https://addis-shop-backend.addis-shop-2026.workers.dev'

const PAGE_VERSION = Date.now()

function ProductImage({ id, onClick, priority }) {
  const [loaded, setLoaded] = useState(false)
  const [failed, setFailed] = useState(false)

  const imageUrl =
    `${API_URL}/clothes-image?id=${id}&v=${PAGE_VERSION}`

  return (
    <button
      type="button"
      className="product-image"
      onClick={onClick}
      aria-label="View clothing picture larger"
      disabled={failed}
    >
      {!loaded && !failed && <div className="skeleton" />}

      {failed ? (
        <div className="empty-card">Photo unavailable</div>
      ) : (
        <img
          src={imageUrl}
          alt="Clothing"
          loading={priority ? 'eager' : 'lazy'}
          fetchPriority={priority ? 'high' : 'auto'}
          decoding="async"
          onLoad={() => setLoaded(true)}
          onError={() => setFailed(true)}
          style={{
            display: 'block',
            width: '100%',
            height: '100%',
            objectFit: 'contain',
            opacity: loaded ? 1 : 0,
          }}
        />
      )}
    </button>
  )
}

function App() {
  const [clothes, setClothes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [selectedImage, setSelectedImage] = useState(null)

  useEffect(() => {
    let cancelled = false

    async function loadClothes() {
      try {
        const response = await fetch(
          `${API_URL}/clothes-list`,
          { cache: 'no-store' }
        )

        if (!response.ok) {
          throw new Error(`Request failed: ${response.status}`)
        }

        const data = await response.json()

        if (!Array.isArray(data)) {
          throw new Error('Invalid product list')
        }

        if (!cancelled) {
          setClothes(data)
          setError(false)
        }
      } catch (err) {
        console.error('CLOTHING LIST ERROR:', err)

        if (!cancelled) {
          setError(true)
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    loadClothes()

    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    if (selectedImage === null) return

    function closeOnEscape(event) {
      if (event.key === 'Escape') {
        setSelectedImage(null)
      }
    }

    document.addEventListener('keydown', closeOnEscape)
    document.body.style.overflow = 'hidden'

    return () => {
      document.removeEventListener('keydown', closeOnEscape)
      document.body.style.overflow = ''
    }
  }, [selectedImage])

  const selectedItem = clothes.find(
    (item) => item.id === selectedImage
  )

  return (
    <div className="shop">
      <header>
        <h1>FERUZA FASHION</h1>
        <p>Clothing Collection</p>
      </header>

      {loading && <p>Loading collection...</p>}

      {error && (
        <p>Could not load the collection. Please try again.</p>
      )}

      {!loading && !error && clothes.length === 0 && (
        <p>No clothing available yet.</p>
      )}

      <div className="products">
        {clothes.map((item, index) => (
          <div className="card" key={item.id}>
            <ProductImage
              id={item.id}
              priority={index < 4}
              onClick={() => setSelectedImage(item.id)}
            />

            {item.price != null && item.price !== '' && (
              <p>{item.price} ETB</p>
            )}
          </div>
        ))}
      </div>

      <div className="contact">
        <a href="tel:+251996669549">📞 Call</a>

        <a
          href="https://wa.me/251996669549"
          target="_blank"
          rel="noopener noreferrer"
        >
          💬 WhatsApp
        </a>

        <a
          href="https://t.me/+251996669549"
          target="_blank"
          rel="noopener noreferrer"
        >
          ✈️ Telegram
        </a>

        <a
          href="https://instagram.com/nuruferuza"
          target="_blank"
          rel="noopener noreferrer"
        >
          📷 Instagram
        </a>
      </div>

      {selectedImage !== null && (
        <div
          className="image-viewer"
          onClick={() => setSelectedImage(null)}
          role="dialog"
          aria-modal="true"
          aria-label="Enlarged clothing picture"
        >
          <button
            type="button"
            className="image-viewer-close"
            onClick={() => setSelectedImage(null)}
            aria-label="Close picture"
          >
            ×
          </button>

          <img
            src={`${API_URL}/clothes-image?id=${selectedImage}&v=${PAGE_VERSION}`}
            alt={
              selectedItem
                ? `Clothing ${selectedItem.id}`
                : 'Enlarged clothing'
            }
            onClick={(event) => event.stopPropagation()}
          />
        </div>
      )}

      <footer>
        <p>© 2026 FERUZA FASHION</p>
      </footer>
    </div>
  )
}

export default App