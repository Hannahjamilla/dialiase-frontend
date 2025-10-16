import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const TreatmentHistory = () => {
    const [history, setHistory] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [expandedDates, setExpandedDates] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchTreatmentHistory = async () => {
            try {
                const response = await axios.get('/api/treatment/history');
                setHistory(response.data.history);
            } catch (err) {
                setError(err.response?.data?.message || 'Failed to fetch treatment history');
                toast.error(err.response?.data?.message || 'Failed to fetch treatment history');
            } finally {
                setLoading(false);
            }
        };

        fetchTreatmentHistory();
    }, []);

    const toggleDate = (date) => {
        setExpandedDates(prev => 
            prev.includes(date) 
                ? prev.filter(d => d !== date) 
                : [...prev, date]
        );
    };

    const formatDate = (dateString) => {
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(dateString).toLocaleDateString('en-US', options);
    };

    const formatTime = (dateString) => {
        return new Date(dateString).toLocaleTimeString('en-US', { 
            hour: '2-digit', 
            minute: '2-digit',
            hour12: true
        });
    };

    const getColorClass = (color) => {
        switch (color) {
            case 'Cloudy': return 'bg-gray-100 text-gray-800';
            case 'Reddish': return 'bg-red-100 text-red-800';
            case 'Clear': return 'bg-blue-100 text-blue-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const calculateBalance = (treatment) => {
        const volumeIn = treatment.insolution?.VolumeIn || 0;
        const volumeOut = treatment.outsolution?.VolumeOut || 0;
        const balance = volumeOut - volumeIn;
        
        if (isNaN(balance)) return 'N/A';
        
        return balance < 0 ? 
            ` ${Math.abs(balance)}` : 
            balance;
    };

    if (loading) return (
        <div className="flex items-center justify-center min-h-screen">
            <div className="text-center">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
                <p className="text-gray-600">Loading treatment history...</p>
            </div>
        </div>
    );

    if (error) return (
        <div className="flex items-center justify-center min-h-screen">
            <div className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-red-100 text-red-600 mb-4">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                </div>
                <p className="text-red-600 max-w-md mx-auto">{error}</p>
                <button 
                    onClick={() => window.location.reload()}
                    className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
                >
                    Try Again
                </button>
            </div>
        </div>
    );

    if (Object.keys(history).length === 0) return (
        <div className="flex items-center justify-center min-h-screen">
            <div className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gray-100 text-gray-500 mb-4">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-700">No treatment history found</h3>
                <p className="text-gray-500 mt-2">Your treatment records will appear here once available</p>
                <button 
                    onClick={() => navigate('/dashboard')}
                    className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
                >
                    Return to Dashboard
                </button>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="container mx-auto px-4 py-8 max-w-6xl">
                <div className="flex items-center mb-8">
                    <button 
                        onClick={() => navigate('/dashboard')}
                        className="flex items-center text-blue-600 hover:text-blue-800 transition"
                    >
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                        Back to Dashboard
                    </button>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
                    <h1 className="text-3xl font-bold text-gray-800 mb-2">Treatment History</h1>
                    <p className="text-gray-600">Review your past dialysis treatments and outcomes</p>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    {Object.entries(history).map(([date, treatments]) => (
                        <div key={date} className="border-b last:border-b-0">
                            <button
                                onClick={() => toggleDate(date)}
                                className="w-full px-6 py-5 text-left hover:bg-gray-50 focus:outline-none flex justify-between items-center transition"
                            >
                                <div className="flex items-center">
                                    <div className="bg-blue-100 text-blue-800 rounded-lg p-2 mr-4">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <h2 className="text-lg font-semibold text-gray-800">
                                            {formatDate(date)}
                                        </h2>
                                        <p className="text-sm text-gray-500">
                                            {treatments.length} treatment{treatments.length !== 1 ? 's' : ''}
                                        </p>
                                    </div>
                                </div>
                                <span className="text-gray-500">
                                    {expandedDates.includes(date) ? (
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                                        </svg>
                                    ) : (
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                        </svg>
                                    )}
                                </span>
                            </button>

                            {expandedDates.includes(date) && (
                                <div className="px-6 pb-6">
                                    <div className="space-y-4">
                                        {treatments.map((treatment) => (
                                            <div key={treatment.Treatment_ID} className="border rounded-lg p-5 hover:shadow-md transition bg-gray-50">
                                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                                    <div className="bg-white p-4 rounded-lg shadow-xs">
                                                        <h3 className="font-semibold text-gray-700 mb-3 pb-2 border-b border-gray-200 flex items-center">
                                                            <svg className="w-4 h-4 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                            </svg>
                                                            Timing
                                                        </h3>
                                                        <ul className="space-y-2 text-sm">
                                                            <li className="flex justify-between">
                                                                <span className="text-gray-500">Started:</span> 
                                                                <span className="font-medium">{formatTime(treatment.insolution.InStarted)}</span>
                                                            </li>
                                                            <li className="flex justify-between">
                                                                <span className="text-gray-500">Inflow Finished:</span> 
                                                                <span className="font-medium">{formatTime(treatment.insolution.InFinished)}</span>
                                                            </li>
                                                            <li className="flex justify-between">
                                                                <span className="text-gray-500">Drain Started:</span> 
                                                                <span className="font-medium">{treatment.outsolution.DrainStarted ? formatTime(treatment.outsolution.DrainStarted) : 'N/A'}</span>
                                                            </li>
                                                            <li className="flex justify-between">
                                                                <span className="text-gray-500">Drain Finished:</span> 
                                                                <span className="font-medium">{treatment.outsolution.DrainFinished ? formatTime(treatment.outsolution.DrainFinished) : 'N/A'}</span>
                                                            </li>
                                                        </ul>
                                                    </div>

                                                    <div className="bg-white p-4 rounded-lg shadow-xs">
                                                        <h3 className="font-semibold text-gray-700 mb-3 pb-2 border-b border-gray-200 flex items-center">
                                                            <svg className="w-4 h-4 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                                            </svg>
                                                            Volumes
                                                        </h3>
                                                        <ul className="space-y-2 text-sm">
                                                            <li className="flex justify-between">
                                                                <span className="text-gray-500">In:</span> 
                                                                <span className="font-medium">{treatment.insolution.VolumeIn} mL</span>
                                                            </li>
                                                            <li className="flex justify-between">
                                                                <span className="text-gray-500">Out:</span> 
                                                                <span className="font-medium">{treatment.outsolution.VolumeOut || 'N/A'} mL</span>
                                                            </li>
                                                            <li className="flex justify-between">
                                                                <span className="text-gray-500">Balance:</span> 
                                                                <span className={`font-medium ${calculateBalance(treatment).startsWith('-') ? 'text-red-600' : 'text-green-600'}`}>
                                                                    {calculateBalance(treatment)} mL
                                                                </span>
                                                            </li>
                                                        </ul>
                                                    </div>

                                                    <div className="bg-white p-4 rounded-lg shadow-xs">
                                                        <h3 className="font-semibold text-gray-700 mb-3 pb-2 border-b border-gray-200 flex items-center">
                                                            <svg className="w-4 h-4 mr-2 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                            </svg>
                                                            Details
                                                        </h3>
                                                        <ul className="space-y-2 text-sm">
                                                            <li className="flex justify-between">
                                                                <span className="text-gray-500">PD-Solution:</span> 
                                                                <span className="font-medium">{treatment.insolution.Dialysate}%</span>
                                                            </li>
                                                            <li className="flex justify-between">
                                                                <span className="text-gray-500">Dwell Time:</span> 
                                                                <span className="font-medium">{treatment.insolution.Dwell} hours</span>
                                                            </li>
                                                            <li className="flex justify-between">
                                                                <span className="text-gray-500">Drain Color:</span> 
                                                                {treatment.outsolution.Color && (
                                                                    <span className={`ml-2 px-2 py-1 rounded-full text-xs ${getColorClass(treatment.outsolution.Color)}`}>
                                                                        {treatment.outsolution.Color}
                                                                    </span>
                                                                )}
                                                            </li>
                                                            {treatment.outsolution.Notes && (
                                                                <li className="pt-2">
                                                                    <div className="text-gray-500 mb-1">Notes:</div> 
                                                                    <div className="bg-yellow-50 text-yellow-800 text-sm p-2 rounded">
                                                                        {treatment.outsolution.Notes}
                                                                    </div>
                                                                </li>
                                                            )}
                                                        </ul>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default TreatmentHistory;