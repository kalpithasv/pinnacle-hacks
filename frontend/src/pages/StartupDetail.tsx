import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

type Startup = {
  id?: string;
  name?: string;
  description?: string;
  employeeCount?: number;
  location?: string;
  businessModel?: string;
  targetMarket?: string;
  landType?: string;
  landArea?: number;
};

const StartupDetail: React.FC = () => {
  const { id } = useParams<{ id?: string }>();
  const [startup, setStartup] = useState<Startup | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setError("No startup id provided in route.");
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/startups/${encodeURIComponent(id)}`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        setStartup(data);
      } catch (err: any) {
        setError(err.message || "Failed to load startup");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  if (loading) return <div>Loading startup details...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!startup) return <div>No startup data available.</div>;

  return (
    <div style={{ padding: 16 }}>
      <h1>{startup.name || "Startup"}</h1>
      <p>
        <strong>Description:</strong> {startup.description || "N/A"}
      </p>
      <p>
        <strong>Employees:</strong> {startup.employeeCount ?? "N/A"}
      </p>
      <p>
        <strong>Location:</strong> {startup.location || "N/A"}
      </p>
      <p>
        <strong>Business Model:</strong> {startup.businessModel || "N/A"}
      </p>
      <p>
        <strong>Target Market:</strong> {startup.targetMarket || "N/A"}
      </p>
      <p>
        <strong>Land Type:</strong> {startup.landType || "N/A"}
      </p>
      <p>
        <strong>Land Area (acres):</strong> {startup.landArea ?? "N/A"}
      </p>
      {/* ...additional UI or actions can be added here... */}
    </div>
  );
};

export default StartupDetail;
