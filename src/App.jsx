import { useEffect, useState } from 'react'
import './App.css'

const API_URL =
  'https://addis-shop-backend.addis-shop-2026.workers.dev'

function App() {
  const [clothes, setClothes] = useState([])

  useEffect(() => {
    fetch(`${API_URL}/clothes`)
      .then((response) => response.json())
      .then((data) => setClothes(data))
      .catch((error) => console.error(error))
  }, [])

  return (
    <div className="shop">
      <header>
        <h1>ADDIS SHOP</h1>
        <p>Clothing Collection</p>
      </header>

      <div className="products">
        {clothes.map((item) => (
          <div className="card" key={item.id}>
            {item.image_data ? (
              <img src={item.image_data} alt="Clothing" />
            ) : (
              <div className="empty-card">
                Available
              </div>
            )}

            {item.price && <p>{item.price} ETB</p>}
          </div>
        ))}
      </div>

      <div className="contact">
        <a href="tel:+251934496830">
          📞 Call
        </a>

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
      </div>
    </div>
  )
}

export default App