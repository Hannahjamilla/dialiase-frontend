import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const EndTreatment = () => {
    const navigate = useNavigate();
    const [ongoingTreatment, setOngoingTreatment] = useState(null);
    const [formData, setFormData] = useState({
        drainFinished: '',
        volumeOut: '',
        color: 'clear',
        notes: ''
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchOngoingTreatment = async () => {
            try {
                const response = await axios.get('/api/treatment/ongoing');
                if (response.data) {
                    setOngoingTreatment(response.data);
                } else {
                    navigate('/dashboard');
                }
                setLoading(false);
            } catch (err) {
                setError(err.message);
                setLoading(false);
            }
        };

        fetchOngoingTreatment();
    }, [navigate]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        try {
            const payload = {
                treatment_id: ongoingTreatment.id,
                drainFinished: formData.drainFinished || new Date().toISOString(),
                volumeOut: formData.volumeOut,
                color: formData.color,
                notes: formData.notes
            };

            await axios.post('/api/treatment/end', payload);
            alert('Treatment completed successfully!');
            navigate('/dashboard');
        } catch (error) {
            console.error('Error completing treatment:', error);
            alert('Failed to complete treatment. Please try again.');
        }
    };

    if (loading) return <div className="text-center py-8">Loading...</div>;
    if (error) return <div className="text-center py-8 text-red-500">Error: {error}</div>;

    return (
        <div className="container mx-auto px-4 py-8">
            <h3 className="text-blue-600 mb-6">
                <button onClick={() => navigate(-1)} className="flex items-center">
                    <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    Back
                </button>
            </h3>

            <h2 className="text-3xl font-bold text-gray-800 mb-8">Complete PD Treatment</h2>

            <form onSubmit={handleSubmit} className="max-w-2xl mx-auto bg-white p-6 rounded-lg shadow-md">
                <div className="mb-6">
                    <label htmlFor="drainFinished" className="block text-gray-700 font-medium mb-2">Drain Finished Time:</label>
                    <input
                        type="datetime-local"
                        id="drainFinished"
                        name="drainFinished"
                        value={formData.drainFinished}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <p className="text-sm text-gray-500 mt-1">Leave blank to use current time</p>
                </div>

                <div className="mb-6">
                    <label htmlFor="volumeOut" className="block text-gray-700 font-medium mb-2">Volume Out (in mL):</label>
                    <input
                        type="number"
                        id="volumeOut"
                        name="volumeOut"
                        value={formData.volumeOut}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                <div className="mb-6">
                    <label htmlFor="color" className="block text-gray-700 font-medium mb-2">Drain Color:</label>
                    <select
                        id="color"
                        name="color"
                        value={formData.color}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="clear">Clear</option>
                        <option value="cloudy">Cloudy</option>
                        <option value="pink">Pink</option>
                        <option value="brown">Brown</option>
                        <option value="other">Other</option>
                    </select>
                </div>

                <div className="mb-6">
                    <label htmlFor="notes" className="block text-gray-700 font-medium mb-2">Notes:</label>
                    <textarea
                        id="notes"
                        name="notes"
                        value={formData.notes}
                        onChange={handleInputChange}
                        rows="3"
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    ></textarea>
                </div>

                <button
                    type="submit"
                    className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-md transition duration-300"
                >
                    Complete Treatment
                </button>
            </form>
        </div>
    );
};

export default EndTreatment;