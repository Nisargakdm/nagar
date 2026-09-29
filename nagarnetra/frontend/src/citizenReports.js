import { useState, useEffect } from 'react';

// Shared local storage for Citizen Reports
export function useCitizenReports() {
  const [reports, setReports] = useState(() => {
    const saved = localStorage.getItem('nagar_citizen_reports');
    if (saved) {
      return JSON.parse(saved);
    }
    // Default initial mock data
    return [
      { id: 'RPT-842', type: 'Pothole', location: 'MG Road, near Metro', status: 'Under Review', date: new Date().toLocaleDateString(), description: 'Large pothole causing traffic slowdown.', lat: 18.515, lon: 73.85 },
      { id: 'RPT-791', type: 'Broken Divider', location: 'FC Road', status: 'Resolved', date: new Date(Date.now() - 86400000 * 2).toLocaleDateString(), description: 'Divider pieces scattered on the road.', lat: 18.52, lon: 73.84 },
    ];
  });

  useEffect(() => {
    localStorage.setItem('nagar_citizen_reports', JSON.stringify(reports));
  }, [reports]);

  const addReport = (reportData) => {
    const newReport = {
      id: `RPT-${Math.floor(Math.random() * 1000)}`,
      status: 'Submitted',
      date: new Date().toLocaleDateString(),
      ...reportData
    };
    setReports(prev => [newReport, ...prev]);
    return newReport;
  };

  const updateReportStatus = (id, newStatus) => {
    setReports(prev => prev.map(r => r.id === id ? { ...r, status: newStatus } : r));
  };

  return { reports, addReport, updateReportStatus };
}
