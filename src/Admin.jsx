import { useEffect, useState } from 'react'
import './App.css'

const API_URL =
  'https://addis-shop-backend.addis-shop-2026.workers.dev'

const ADMIN_PASSWORD = '1234'

function AdminProductImage({ item, imageVersion }) {
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    setFailed(false)
  }, [item.id, item.imageChanged, item.image_data, imageVersion])

  const imageUrl =
    item.imageChanged && item.image_data
      ? item.image_data
      : `${API_URL}/clothes-image?id=${item.id}&v=${imageVersion}`

  if (failed) {
    return <div className="upload-box">No picture</div>
  }

  return (
    <img
      className="admin-image"
      src={imageUrl}
      alt={`Clothing ${item.id}`}
      loading="lazy"
      decoding="async"
      onError={() => setFailed(true)}
    />
  )
}

function Admin() {
  const [password, setPassword] = useState('')
  const [loggedIn, setLoggedIn] = useState(false)
  const [clothes, setClothes] = useState([])
  const [loading, setLoading] = useState(false)
  const [savingId, setSavingId] = useState(null)
  const [imageVersion, setImageVersion] = useState(Date.now())

  const loadClothes = async () => {
    setLoading(true)

    try {
      // Load only IDs and prices, not every picture's base64 data.
      const response = await fetch(`${API_URL}/clothes-list`, {
        cache: 'no-store',
      })

      if (!response.ok) {
        throw new Error('Could not load clothing')
      }

      const data = await response.json()

      if (!Array.isArray(data)) {
        throw new Error('Invalid clothing list')
      }

      setClothes(data)
      setImageVersion(Date.now())
    } catch (error) {
      console.error('LOAD CLOTHING ERROR:', error)
      alert('Could not load clothing. Please refresh the page.')
    } finally {
      setLoading(false)
    }
  }

  const login = () => {
    if (password === ADMIN_PASSWORD) {
      setLoggedIn(true)
    } else {
      alert('Wrong password')
    }
  }

  useEffect(() => {
    if (loggedIn) {
      loadClothes()
    }
  }, [loggedIn])

  const updateItem = (id, changes) => {
    setClothes((current) =>
      current.map((item) =>
        item.id === id ? { ...item, ...changes } : item
      )
    )
  }

  const handleImage = (id, file) => {
    if (!file) return

    if (!file.type.startsWith('image/')) {
      alert('Please select an image file.')
      return
    }

    const reader = new FileReader()

    reader.onload = () => {
      const img = new Image()

      img.onload = () => {
        const maxWidth = 800
        const maxHeight = 800

        let width = img.width
        let height = img.height

        const scale = Math.min(
          maxWidth / width,
          maxHeight / height,
          1
        )

        width = Math.round(width * scale)
        height = Math.round(height * scale)

        const canvas = document.createElement('canvas')
        canvas.width = width
        canvas.height = height

        const ctx = canvas.getContext('2d')

        if (!ctx) {
          alert('Could not process this picture.')
          return
        }

        ctx.drawImage(img, 0, 0, width, height)

        const compressedImage = canvas.toDataURL(
          'image/jpeg',
          0.7
        )

        updateItem(id, {
          image_data: compressedImage,
          imageChanged: true,
        })
      }

      img.onerror = () => {
        alert('Could not open this picture. Try another image.')
      }

      img.src = reader.result
    }

    reader.onerror = () => {
      alert('Could not read this picture.')
    }

    reader.readAsDataURL(file)
  }

  const saveItem = async (item) => {
    setSavingId(item.id)

    try {
      const payload = {
        id: item.id,
        price: item.price ?? '',
      }

      // Send a picture only when a new one was selected.
      if (item.imageChanged && item.image_data) {
        payload.image_data = item.image_data
      }

      const response = await fetch(`${API_URL}/clothes`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        throw new Error(`Save failed: ${response.status}`)
      }

      alert(`Clothing ${item.id} saved successfully.`)

      await loadClothes()
    } catch (error) {
      console.error('SAVE ERROR:', error)
      alert(
        'Could not save the clothing. Please check the connection and try again.'
      )
    } finally {
      setSavingId(null)
    }
  }

  if (!loggedIn) {
    return (
      <div className="admin-page">
        <h1>FERUZA FASHION ADMIN</h1>
        <p>Enter password to continue</p>

        <div className="admin-card">
          <input
            className="price-input"
            type="password"
            placeholder="Admin password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button className="save-button" onClick={login}>
            Login
          </button>
        </div>
      </div>
    )
  }

  if (loading && clothes.length === 0) {
    return <p>Loading clothing...</p>
  }

  return (
    <div className="admin-page">
      <h1>FERUZA FASHION ADMIN</h1>
      <p>Update pictures and prices</p>

      <button
        className="save-button"
        onClick={loadClothes}
        disabled={loading || savingId !== null}
      >
        {loading ? 'Refreshing...' : 'Refresh clothing'}
      </button>

      <div className="admin-products">
        {clothes.map((item) => (
          <div className="admin-card" key={item.id}>
            <h3>Clothing {item.id}</h3>

            <AdminProductImage
              item={item}
              imageVersion={imageVersion}
            />

            <label className="file-label">
              Change picture
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  handleImage(item.id, e.target.files[0])
                  e.target.value = ''
                }}
              />
            </label>

            <input
              className="price-input"
              type="text"
              placeholder="Price (optional)"
              value={item.price ?? ''}
              onChange={(e) =>
                updateItem(item.id, {
                  price: e.target.value,
                })
              }
            />

            <button
              className="save-button"
              onClick={() => saveItem(item)}
              disabled={savingId !== null}
            >
              {savingId === item.id ? 'Saving...' : 'Save'}
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}

export default Admin