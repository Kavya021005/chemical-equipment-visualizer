import React, { useState, useEffect } from 'react';
import {
  PieChart, Pie, Cell, BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import './EquipmentCharts.css';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

const EquipmentCharts = ({ records, dataset }) => {
  const [animationKey, setAnimationKey] = useState(0);

  // Trigger re-animation when records change
  useEffect(() => {
    setAnimationKey(prev => prev + 1);
  }, [records]);

  // Calculate equipment type distribution
  const getTypeDistribution = () => {
    const distribution = {};
    records.forEach(record => {
      const type = record.type || 'Unknown';
      distribution[type] = (distribution[type] || 0) + 1;
    });
    
    return Object.entries(distribution).map(([name, value]) => ({
      name,
      value
    }));
  };

  // Get average values by equipment type
  const getAveragesByType = () => {
    const typeData = {};
    
    records.forEach(record => {
      const type = record.type || 'Unknown';
      if (!typeData[type]) {
        typeData[type] = {
          count: 0,
          totalFlow: 0,
          totalPressure: 0,
          totalTemp: 0
        };
      }
      
      typeData[type].count++;
      typeData[type].totalFlow += parseFloat(record.flowrate) || 0;
      typeData[type].totalPressure += parseFloat(record.pressure) || 0;
      typeData[type].totalTemp += parseFloat(record.temperature) || 0;
    });

    return Object.entries(typeData).map(([name, data]) => ({
      name,
      flowrate: (data.totalFlow / data.count).toFixed(1),
      pressure: (data.totalPressure / data.count).toFixed(1),
      temperature: (data.totalTemp / data.count).toFixed(1)
    }));
  };

  // Get trend data (first 10 records for visualization)
  const getTrendData = () => {
    return records.slice(0, 10).map((record, index) => ({
      name: record.equipment_name || `Equipment ${index + 1}`,
      flowrate: parseFloat(record.flowrate) || 0,
      pressure: parseFloat(record.pressure) || 0,
      temperature: parseFloat(record.temperature) || 0
    }));
  };

  const typeDistribution = getTypeDistribution();
  const averagesByType = getAveragesByType();
  const trendData = getTrendData();

  // Calculate summary statistics
  const totalEquipment = records.length;
  const avgFlowrate = dataset?.avg_flowrate || 
    (records.reduce((sum, r) => sum + (parseFloat(r.flowrate) || 0), 0) / records.length).toFixed(2);
  const avgPressure = dataset?.avg_pressure || 
    (records.reduce((sum, r) => sum + (parseFloat(r.pressure) || 0), 0) / records.length).toFixed(2);
  const avgTemp = dataset?.avg_temperature || 
    (records.reduce((sum, r) => sum + (parseFloat(r.temperature) || 0), 0) / records.length).toFixed(2);

  return (
    <div className="equipment-charts">
      {/* Summary Stats Cards */}
      <div className="stats-cards">
        <div className="stat-card-chart" style={{ animationDelay: '0.1s' }}>
          <div className="stat-icon">📊</div>
          <div className="stat-content">
            <div className="stat-label">Total Equipment</div>
            <div className="stat-value">{totalEquipment}</div>
          </div>
        </div>
        
        <div className="stat-card-chart" style={{ animationDelay: '0.2s' }}>
          <div className="stat-icon">💨</div>
          <div className="stat-content">
            <div className="stat-label">Avg Flow Rate</div>
            <div className="stat-value">{avgFlowrate}</div>
          </div>
        </div>
        
        <div className="stat-card-chart" style={{ animationDelay: '0.3s' }}>
          <div className="stat-icon">⚡</div>
          <div className="stat-content">
            <div className="stat-label">Avg Pressure</div>
            <div className="stat-value">{avgPressure}</div>
          </div>
        </div>
        
        <div className="stat-card-chart" style={{ animationDelay: '0.4s' }}>
          <div className="stat-icon">🌡️</div>
          <div className="stat-content">
            <div className="stat-label">Avg Temperature</div>
            <div className="stat-value">{avgTemp}°</div>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="charts-grid">
        {/* Equipment Type Distribution - Pie Chart */}
        <div className="chart-card" style={{ animationDelay: '0.5s' }}>
          <h3 className="chart-title">Equipment Type Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart key={`pie-${animationKey}`}>
              <Pie
                data={typeDistribution}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
                animationBegin={0}
                animationDuration={800}
              >
                {typeDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Average Parameters by Type - Bar Chart */}
        <div className="chart-card chart-card-wide" style={{ animationDelay: '0.6s' }}>
          <h3 className="chart-title">Average Parameters by Equipment Type</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={averagesByType} key={`bar-${animationKey}`}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="flowrate" fill="#0088FE" name="Flow Rate" animationDuration={800} />
              <Bar dataKey="pressure" fill="#00C49F" name="Pressure" animationDuration={800} animationBegin={200} />
              <Bar dataKey="temperature" fill="#FFBB28" name="Temperature" animationDuration={800} animationBegin={400} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Parameter Trends - Line Chart */}
        <div className="chart-card chart-card-wide" style={{ animationDelay: '0.7s' }}>
          <h3 className="chart-title">Parameter Trends (First 10 Equipment)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={trendData} key={`line-${animationKey}`}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="flowrate" 
                stroke="#0088FE" 
                strokeWidth={2}
                name="Flow Rate"
                animationDuration={1000}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
              />
              <Line 
                type="monotone" 
                dataKey="pressure" 
                stroke="#00C49F" 
                strokeWidth={2}
                name="Pressure"
                animationDuration={1000}
                animationBegin={200}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
              />
              <Line 
                type="monotone" 
                dataKey="temperature" 
                stroke="#FFBB28" 
                strokeWidth={2}
                name="Temperature"
                animationDuration={1000}
                animationBegin={400}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default EquipmentCharts;
