export default function Home() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-center mb-8">
          IoT Platform Dashboard
        </h1>
        <div className="dashboard-grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          <div className="dashboard-card">
            <h2 className="text-xl font-semibold mb-4">Device Status</h2>
            <div className="space-y-2">
              <div className="device-status-online">
                <span className="status-indicator online mr-2"></span>
                Online Devices: 24
              </div>
              <div className="device-status-offline">
                <span className="status-indicator offline mr-2"></span>
                Offline Devices: 3
              </div>
              <div className="device-status-warning">
                <span className="status-indicator warning mr-2"></span>
                Warning Devices: 1
              </div>
            </div>
          </div>
          
          <div className="metric-card">
            <div className="metric-value">28</div>
            <div className="metric-label">Total Devices</div>
          </div>
          
          <div className="metric-card">
            <div className="metric-value">95.2%</div>
            <div className="metric-label">Uptime</div>
          </div>
        </div>
      </main>
    </div>
  );
}
