import { useState } from 'react'
import axios from 'axios'
import PostSubletPhoto from './PostSubletPhoto'
import './PostSubletForm.css'

const PostSublet = () => {
    const [location, setLocation] = useState('')
    const [price, setPrice] = useState('')
    const [fromDate, setFromDate] = useState('')
    const [toDate, setToDate] = useState('')
    const [description, setDescription] = useState('')
    const [photos, setPhotos] = useState([])
    const [error, setError] = useState('')
    const [title, setTitle] = useState('')
    const [success, setSuccess] = useState('')
    const API = 'http://localhost:3000'

    const handlePhotoSelect = e => {
        const chosen = Array.from(e.target.files).map(file => ({file: file, url: URL.createObjectURL(file),}))
        setPhotos([...photos, ...chosen])
        e.target.value = '' 
    }

    const movePhoto = (index, offset) => {
        const newPhotos = [...photos]
        const other = index + offset;
        [newPhotos[index], newPhotos[other]] = [newPhotos[other], newPhotos[index]]
        setPhotos(newPhotos)
    }

    const removePhoto = index => {
        setPhotos(photos.filter((photo, i) => i !== index))
    }

    const handleSubmit = async e => {
        e.preventDefault()
        setError('')
        setSuccess('')
    
        if (photos.length === 0) {
            setError('Please add at least one photo.')
            return
        }
    
        try {
            const formData = new FormData()
            photos.forEach(p => formData.append('photos', p.file))
            const uploadRes = await axios.post(`${API}/api/uploads/listing-images`, formData)

            await axios.post(`${API}/api/listings`, {
                title: title,
                location: location,
                price: price,
                startDate: fromDate, 
                endDate: toDate,
                description: description,
                photos: uploadRes.data.urls,
            })
    
            setSuccess('Your listing was posted!')
            setTitle('')
            setLocation('')
            setPrice('')
            setFromDate('')
            setToDate('')
            setDescription('')
            setPhotos([])
        } catch (err) {
            setError(err.response?.data?.error || 'Something went wrong posting your listing.')
        }
    }

    return (
        <form onSubmit={handleSubmit}>
            <div className="title">
                <label htmlFor="title">Title</label>
                <br />
                <input
                    type="text"
                    id="title"
                    placeholder="e.g. Sunny studio near campus"
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    required
                />
                <br />
            </div>
            <div className="location">
                <label htmlFor="location">Location</label>
                <br />
                <input
                    type="text"
                    id="location"
                    placeholder="Street address, city, state"
                    value={location}
                    onChange={e => setLocation(e.target.value)}
                    required
                />
                <br />
            </div>

            <div className="price">
                <label htmlFor="price">Monthly Cost</label>
                <br />
                <input
                    type="number"
                    id="price"
                    placeholder="Enter monthly rent"
                    value={price}
                    min="0"
                    step="0.01"
                    onChange={e => setPrice(e.target.value)}
                    required
                />
                <br />
            </div>

            <div className="fromDate">
                <label htmlFor="fromDate">Available From</label>
                <br />
                <input
                    type="date"
                    id="fromDate"
                    value={fromDate}
                    onChange={e => setFromDate(e.target.value)}
                    required
                />
                <br />
            </div>

            <div className="toDate">
                <label htmlFor="toDate">Available Until</label>
                <br />
                <input
                    type="date"
                    id="toDate"
                    value={toDate}
                    onChange={e => setToDate(e.target.value)}
                    required
                />
                <br />
            </div>

            <div className="description">
                <label htmlFor="description">Description</label>
                <br />
                <textarea
                    id="description"
                    rows={5}
                    cols={40}
                    placeholder="Describe the apartment, amenities, and roommate situation..."
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    required
                />
                <br />
            </div>

            <div className="photos">
                <label htmlFor="photos" className="PostSublet-photoButton">
                    Add photos
                </label>
                <input
                    type="file"
                    accept="image/*"
                    id="photos"
                    onChange={handlePhotoSelect}
                    multiple
                    hidden
                />
                <p>{photos.length === 0 ? 'No photos added yet' : `${photos.length} photo(s) added`}</p>

                <ul className="PostSubletPhoto-list">
                    {photos.map((photo, index) => (
                        <PostSubletPhoto
                            key={photo.url}
                            url={photo.url}
                            position={index + 1}
                            isFirst={index === 0}
                            isLast={index === photos.length - 1}
                            handleMoveEarlier={() => movePhoto(index, -1)}
                            handleMoveLater={() => movePhoto(index, 1)}
                            handleRemove={() => removePhoto(index)}
                        />
                    ))}
                </ul>
            </div>
            {error && (
                <div>
                    <p className="PostSublet-Feedback">{error}</p>
                </div>
            )}
            <input type="submit" value="Post Listing" />
        </form>
    )
}

export default PostSublet