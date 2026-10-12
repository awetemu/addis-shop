import { useEffect, useState } from 'react'
import './App.css'

const API_URL =
  'https://addis-shop-backend.addis-shop-2026.workers.dev'

function ProductImage({ id }) {
  const [loaded, setLoaded] = useState(false)
  const [failed, setFailed] = useState(false)

  const imageUrl = `${API_URL}/clothes-image?id=${id}`

  return (
    <div className="product-image">
      {!loaded && !failed && <div className="skeleton" />}

      {failed ? (
        <div className="empty-card">Photo unavailable</div>
      ) : (
        <img
          src={imageUrl}
          alt="Clothing"
          decoding="async"
          onLoad={() => {
            console.log('PHOTO LOADED:', id, imageUrl)
            setLoaded(true)
          }}
          onError={() => {
            console.error('PHOTO FAILED:', id, imageUrl)
            setFailed(true)
          }}
          style={{
            display: 'block',
            width: '100%',
            height: '100%',
            objectFit: 'contain',
          }}
        />
      )}
    </div>
  )
}

function App() {
  const [clothes, setClothes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    fetch(`${API_URL}/clothes-list`)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Request failed: ${response.status}`)
        }
        return response.json()
      })
      .then((data) => {
        console.log('CLOTHING DATA:', data)
        console.log('FIRST ITEM:', data[0])
        setClothes(data)
      })
      .catch((err) => {
        console.error('CLOTHING LIST ERROR:', err)
        setError(true)
      })
      .finally(() => {
        setLoading(false)
      })
  }, [])

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

      <div className="products">
        {clothes.map((item) => (
          <div className="card" key={item.id}>
            <ProductImage id={item.id} />
            {item.price && <p>{item.price} ETB</p>}
          </div>
        ))}
      </div>

      <div className="contact">
        <a href="tel:+251934496830">📞 Call</a>

        <a
          href="https://wa.me/251934496830"
          target="_blank"
          rel="noopener noreferrer"
        >
          💬 WhatsApp
        </a>

        <a
          href="https://t.me/Emufh"
          target="_blank"
          rel="noopener noreferrer"
        >
          ✈️ Telegram
        </a>

        <a
          href="https://instagram.com/awet5136"
          target="_blank"
          rel="noopener noreferrer"
        >
          📷 Instagram
        </a>

        <a
          href="https://wa.me/251934496830?text=Hello%20FERUZA%20FASHION%2C%20I%20would%20like%20to%20ask%20about%20your%20clothes."
          target="_blank"
          rel="noopener noreferrer"
        >
          💌 Message Me
        </a>
      </div>

      <footer>
        <p>© 2026 FERUZA FASHION</p>
      </footer>
    </div>
  )
}

export default App