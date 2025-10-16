import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Table, Tag, Select, Button, Modal, Input, DatePicker, message } from 'antd';
import moment from 'moment';

const { Column } = Table;
const { Option } = Select;
const { TextArea } = Input;

const ScheduleList = () => {
    const [schedules, setSchedules] = useState([]);
    const [loading, setLoading] = useState(false);
    const [filters, setFilters] = useState({
        date: null,
        confirmation_status: null,
        checkup_status: null
    });
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [currentSchedule, setCurrentSchedule] = useState(null);
    const [remarks, setRemarks] = useState('');
    
    useEffect(() => {
        fetchSchedules();
    }, [filters]);
    
    const fetchSchedules = async () => {
        setLoading(true);
        try {
            const params = {};
            if (filters.date) params.date = filters.date.format('YYYY-MM-DD');
            if (filters.confirmation_status) params.confirmation_status = filters.confirmation_status;
            if (filters.checkup_status) params.checkup_status = filters.checkup_status;
            
            const response = await axios.get('/api/schedules', { params });
            setSchedules(response.data);
        } catch (error) {
            message.error('Failed to fetch schedules');
        } finally {
            setLoading(false);
        }
    };
    
    const handleStatusChange = async (field, value, schedule) => {
        try {
            await axios.patch(`/api/schedules/${schedule.schedule_id}/status`, {
                field,
                value,
                remarks: field === 'checkup_status' ? remarks : null
            });
            
            message.success('Status updated successfully');
            fetchSchedules();
            setIsModalVisible(false);
        } catch (error) {
            message.error('Failed to update status');
        }
    };
    
    const showStatusModal = (schedule) => {
        setCurrentSchedule(schedule);
        setRemarks(schedule.remarks || '');
        setIsModalVisible(true);
    };
    
    const handleFilterChange = (key, value) => {
        setFilters(prev => ({ ...prev, [key]: value }));
    };
    
    const resetFilters = () => {
        setFilters({
            date: null,
            confirmation_status: null,
            checkup_status: null
        });
    };
    
    return (
        <div style={{ 
            padding: '24px', 
            backgroundColor: '#f5f5f5', 
            minHeight: '100vh',
            fontFamily: 'Arial, sans-serif'
        }}>
            <div style={{ 
                backgroundColor: 'white', 
                padding: '24px', 
                borderRadius: '8px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
            }}>
                <h1 style={{ 
                    marginBottom: '24px', 
                    color: '#1890ff',
                    fontSize: '24px',
                    fontWeight: '500'
                }}>
                    Patient Schedules
                </h1>
                
                <div style={{ 
                    display: 'flex', 
                    flexWrap: 'wrap', 
                    gap: '10px', 
                    marginBottom: '20px',
                    alignItems: 'center'
                }}>
                    <DatePicker
                        placeholder="Filter by date"
                        value={filters.date}
                        onChange={(date) => handleFilterChange('date', date)}
                        style={{ width: '200px' }}
                    />
                    
                    <Select
                        placeholder="Confirmation Status"
                        value={filters.confirmation_status}
                        onChange={(value) => handleFilterChange('confirmation_status', value)}
                        style={{ width: '200px' }}
                        allowClear
                    >
                        <Option value="confirmed">Confirmed</Option>
                        <Option value="pending">Pending</Option>
                        <Option value="cancelled">Cancelled</Option>
                    </Select>
                    
                    <Select
                        placeholder="Checkup Status"
                        value={filters.checkup_status}
                        onChange={(value) => handleFilterChange('checkup_status', value)}
                        style={{ width: '200px' }}
                        allowClear
                    >
                        <Option value="completed">Completed</Option>
                        <Option value="pending">Pending</Option>
                        <Option value="no_show">No Show</Option>
                    </Select>
                    
                    <Button 
                        onClick={resetFilters}
                        style={{ backgroundColor: '#f0f0f0', borderColor: '#d9d9d9' }}
                    >
                        Reset Filters
                    </Button>
                </div>
                
                <Table
                    dataSource={schedules}
                    loading={loading}
                    rowKey="schedule_id"
                    pagination={{ pageSize: 10 }}
                    scroll={{ x: true }}
                    style={{ 
                        border: '1px solid #f0f0f0',
                        borderRadius: '8px'
                    }}
                >
                    <Column
                        title="Patient ID"
                        dataIndex="patient_id"
                        key="patient_id"
                        width={120}
                    />
                    <Column
                        title="Patient Name"
                        dataIndex={['patient', 'name']}
                        key="patient_name"
                        render={(name, record) => record.patient?.name || 'N/A'}
                        width={180}
                    />
                    <Column
                        title="Appointment Date"
                        dataIndex="appointment_date"
                        key="appointment_date"
                        render={(date) => moment(date).format('LLL')}
                        sorter={(a, b) => new Date(a.appointment_date) - new Date(b.appointment_date)}
                        width={200}
                    />
                    <Column
                        title="Confirmation Status"
                        dataIndex="confirmation_status"
                        key="confirmation_status"
                        render={(status) => (
                            <Tag 
                                color={
                                    status === 'confirmed' ? 'green' : 
                                    status === 'pending' ? 'orange' : 'red'
                                }
                                style={{ 
                                    minWidth: '80px',
                                    textAlign: 'center',
                                    fontWeight: '500'
                                }}
                            >
                                {status ? status.toUpperCase() : 'N/A'}
                            </Tag>
                        )}
                        filters={[
                            { text: 'Confirmed', value: 'confirmed' },
                            { text: 'Pending', value: 'pending' },
                            { text: 'Cancelled', value: 'cancelled' },
                        ]}
                        onFilter={(value, record) => record.confirmation_status === value}
                        width={180}
                    />
                    <Column
                        title="Checkup Status"
                        dataIndex="checkup_status"
                        key="checkup_status"
                        render={(status, record) => (
                            <Tag 
                                color={
                                    status === 'completed' ? 'green' : 
                                    status === 'pending' ? 'orange' : 'red'
                                }
                                onClick={() => showStatusModal(record)}
                                style={{ 
                                    cursor: 'pointer',
                                    minWidth: '80px',
                                    textAlign: 'center',
                                    fontWeight: '500'
                                }}
                            >
                                {status ? status.toUpperCase() : 'N/A'}
                            </Tag>
                        )}
                        width={180}
                    />
                    <Column
                        title="Remarks"
                        dataIndex="remarks"
                        key="remarks"
                        ellipsis
                        render={(text) => text || 'No remarks'}
                    />
                </Table>
                
                <Modal
                    title="Update Checkup Status"
                    visible={isModalVisible}
                    onCancel={() => setIsModalVisible(false)}
                    footer={[
                        <Button 
                            key="cancel" 
                            onClick={() => setIsModalVisible(false)}
                            style={{ borderColor: '#d9d9d9' }}
                        >
                            Cancel
                        </Button>,
                        <Button 
                            key="complete" 
                            type="primary" 
                            onClick={() => handleStatusChange('checkup_status', 'completed', currentSchedule)}
                            style={{ backgroundColor: '#52c41a', borderColor: '#52c41a' }}
                        >
                            Mark as Completed
                        </Button>,
                        <Button 
                            key="no_show" 
                            danger 
                            onClick={() => handleStatusChange('checkup_status', 'no_show', currentSchedule)}
                        >
                            Mark as No Show
                        </Button>,
                    ]}
                    bodyStyle={{ padding: '24px' }}
                >
                    <div style={{ marginBottom: '24px' }}>
                        <p style={{ marginBottom: '8px' }}>
                            <strong style={{ display: 'inline-block', width: '120px' }}>Patient ID:</strong> 
                            {currentSchedule?.patient_id}
                        </p>
                        <p style={{ marginBottom: '8px' }}>
                            <strong style={{ display: 'inline-block', width: '120px' }}>Patient Name:</strong> 
                            {currentSchedule?.patient?.name || 'N/A'}
                        </p>
                        <p>
                            <strong style={{ display: 'inline-block', width: '120px' }}>Appointment Date:</strong> 
                            {moment(currentSchedule?.appointment_date).format('LLL')}
                        </p>
                    </div>
                    
                    <div style={{ marginBottom: '16px' }}>
                        <label style={{ 
                            display: 'block', 
                            marginBottom: '8px',
                            fontWeight: '500'
                        }}>
                            Remarks:
                        </label>
                        <TextArea 
                            rows={4} 
                            value={remarks}
                            onChange={(e) => setRemarks(e.target.value)}
                            placeholder="Enter any remarks about the appointment..."
                            style={{ 
                                border: '1px solid #d9d9d9',
                                borderRadius: '4px',
                                padding: '8px'
                            }}
                        />
                    </div>
                </Modal>
            </div>
        </div>
    );
};

export default ScheduleList;