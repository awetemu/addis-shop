import { useEffect, useState } from 'react'
import './App.css'

const API_URL =
  'https://addis-shop-backend.addis-shop-2026.workers.dev'

const ADMIN_PASSWORD = '1234'

function Admin() {
  const [password, setPassword] = useState('')
  const [loggedIn, setLoggedIn] = useState(false)

  const [clothes, setClothes] = useState([])
  const [loading, setLoading] = useState(false)

  const login = () => {
    if (password === ADMIN_PASSWORD) {
      setLoggedIn(true)
    } else {
      alert('Wrong password')
    }
  }

  useEffect(() => {
    if (!loggedIn) return

    setLoading(true)

    fetch(`${API_URL}/clothes`)
      .then((response) => response.json())
      .then((data) => {
        setClothes(data)
        setLoading(false)
      })
      .catch((error) => {
        console.error(error)
        setLoading(false)
      })
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

    const reader = new FileReader()

    reader.onload = () => {
      const img = new Image()

      img.onload = () => {
        const canvas = document.createElement('canvas')

        const maxWidth = 800
        const maxHeight = 800

        let width = img.width
        let height = img.height

        if (width > maxWidth) {
          height = (height * maxWidth) / width
          width = maxWidth
        }

        if (height > maxHeight) {
          width = (width * maxHeight) / height
          height = maxHeight
        }

        canvas.width = width
        canvas.height = height

        const ctx = canvas.getContext('2d')
        ctx.drawImage(img, 0, 0, width, height)

        const compressedImage = canvas.toDataURL(
          'image/jpeg',
          0.7
        )

        updateItem(id, {
          image_data: compressedImage,
        })
      }

      img.src = reader.result
    }

    reader.readAsDataURL(file)
  }

  const saveItem = async (item) => {
    try {
      const response = await fetch(`${API_URL}/clothes`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: item.id,
          price: item.price || '',
          image_data: item.image_data || '',
        }),
      })

      if (!response.ok) {
        throw new Error('Save failed')
      }

      alert(`Clothing ${item.id} saved!`)
    } catch (error) {
      console.error(error)
      alert('Could not save. Please try a smaller picture.')
    }
  }

  if (!loggedIn) {
    return (
      <div className="admin-page">
        <h1>ADDIS SHOP ADMIN</h1>
        <p>Enter password to continue</p>

        <div className="admin-card">
          <input
            className="price-input"
            type="password"
            placeholder="Admin password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button
            className="save-button"
            onClick={login}
          >
            Login
          </button>
        </div>
      </div>
    )
  }

  if (loading) {
    return <p>Loading...</p>
  }

  return (
    <div className="admin-page">
      <h1>ADDIS SHOP ADMIN</h1>
      <p>Update pictures and prices</p>

      <div className="admin-products">
        {clothes.map((item) => (
          <div className="admin-card" key={item.id}>
            <h3>Clothing {item.id}</h3>

            {item.image_data ? (
              <img
                className="admin-image"
                src={item.image_data}
                alt={`Clothing ${item.id}`}
              />
            ) : (
              <div className="upload-box">
                No picture
              </div>
            )}

            <label className="file-label">
              Change picture
              <input
                type="file"
                accept="image/*"
                onChange={(e) =>
                  handleImage(item.id, e.target.files[0])
                }
              />
            </label>

            <input
              className="price-input"
              type="text"
              placeholder="Price (optional)"
              value={item.price || ''}
              onChange={(e) =>
                updateItem(item.id, {
                  price: e.target.value,
                })
              }
            />

            <button
              className="save-button"
              onClick={() => saveItem(item)}
            >
              Save
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}

export default Admin