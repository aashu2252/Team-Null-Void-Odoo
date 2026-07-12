import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Truck, MapPin, Gauge, Activity, DollarSign, Calendar, Edit, Trash2 } from 'lucide-react';
import api from '../services/api';
import { toast } from 'react-hot-toast';

export default function VehicleDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [vehicle, setVehicle] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchVehicle();
  }, [id]);

  const fetchVehicle = async () => {
    try {
      setIsLoading(true);
      const res = await api.get('/api/vehicles/' + id);
      if (res.data && res.data.success) {
        setVehicle(res.data.data);
      }
    } catch (err) {
      toast.error('Failed to load vehicle details');
      navigate('/dashboard/vehicles');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this vehicle?')) {
      try {
        await api.delete('/api/vehicles/' + id);
        toast.success('Vehicle deleted successfully');
        navigate('/dashboard/vehicles');
      } catch (err) {
        toast.error('Failed to delete vehicle');
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-primary"></div>
      </div>
    );
  }

  if (!vehicle) return null;

  return (
    <div className="space-y-6 max-w-5xl mx-auto font-sans pb-12">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            to="/dashboard/vehicles"
            className="p-2 bg-surface border border-border-custom text-txt-secondary hover:text-txt-primary rounded-xl transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h2 className="text-2xl font-bold text-txt-primary tracking-tight">
              {vehicle.vehicleName}
            </h2>
            <div className="flex items-center gap-3 mt-1">
              <span className="text-sm font-semibold text-txt-secondary">
                {vehicle.model}
              </span>
              <div className="inline-flex items-center justify-center px-2.5 py-0.5 bg-yellow-400 border border-black rounded shadow-sm">
                <span className="text-black font-mono font-bold tracking-widest uppercase text-xs">
                  {vehicle.registrationNumber}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to={`/dashboard/vehicles/${id}/edit`}
            className="flex items-center gap-2 px-4 py-2 bg-brand-primary hover:bg-brand-primary/90 text-white rounded-xl text-sm font-bold shadow-md transition-all cursor-pointer"
          >
            <Edit className="w-4 h-4" />
            <span>Edit</span>
          </Link>
          <button
            onClick={handleDelete}
            className="flex items-center gap-2 px-4 py-2 bg-brand-danger/10 hover:bg-brand-danger/20 border border-brand-danger/20 text-brand-danger rounded-xl text-sm font-bold transition-all cursor-pointer"
          >
            <Trash2 className="w-4 h-4" />
            <span>Delete</span>
          </button>
        </div>
      </div>

      {vehicle.image && (
        <div className="w-full h-64 md:h-80 rounded-3xl overflow-hidden border border-border-custom shadow-premium relative">
          <img src={vehicle.image} alt={vehicle.vehicleName} className="w-full h-full object-cover" />
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Key Stats */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-card-bg border border-border-custom rounded-3xl p-6 shadow-premium">
            <h3 className="text-xs font-bold uppercase tracking-wider text-txt-secondary mb-4">Status & Health</h3>

            <div className="space-y-6">
              <div>
                <div className="flex justify-between text-sm font-bold text-txt-primary mb-2">
                  <span>Operational Status</span>
                  <span className={vehicle.status === 'Available' ? 'text-brand-success' : 'text-brand-warning'}>{vehicle.status}</span>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-sm font-bold text-txt-primary mb-2">
                  <span>Fuel Level</span>
                  <span>{vehicle.fuel || 100}%</span>
                </div>
                <div className="w-full bg-surface dark:bg-card-elevated h-2.5 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${vehicle.fuel <= 20 ? 'bg-brand-danger' : vehicle.fuel <= 50 ? 'bg-brand-warning' : 'bg-brand-teal'}`}
                    style={{ width: `${vehicle.fuel || 100}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-sm font-bold text-txt-primary mb-2">
                  <span>Health Score</span>
                  <span>{vehicle.health || 100}%</span>
                </div>
                <div className="w-full bg-surface dark:bg-card-elevated h-2.5 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${vehicle.health <= 70 ? 'bg-brand-danger' : vehicle.health <= 90 ? 'bg-brand-orange' : 'bg-brand-success'}`}
                    style={{ width: `${vehicle.health || 100}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-card-bg border border-border-custom rounded-3xl p-6 shadow-premium">
            <h3 className="text-xs font-bold uppercase tracking-wider text-txt-secondary mb-4">Assignment</h3>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-brand-primary/10 text-brand-primary flex items-center justify-center font-bold text-sm">
                {vehicle.driver ? (vehicle.driver.user ? vehicle.driver.user.firstName.substring(0, 2).toUpperCase() : (vehicle.driver.name ? vehicle.driver.name.substring(0, 2).toUpperCase() : 'DR')) : 'UN'}
              </div>
              <div>
                <p className="text-sm font-bold text-txt-primary">{vehicle.driver ? (vehicle.driver.user ? `${vehicle.driver.user.firstName} ${vehicle.driver.user.lastName}` : vehicle.driver.name) : 'Unassigned'}</p>
                <p className="text-xs text-txt-secondary">{vehicle.driver ? vehicle.driver.licenseNumber : 'No active driver'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Detailed Specs */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-card-bg border border-border-custom rounded-3xl p-6 md:p-8 shadow-premium">
            <h3 className="text-sm font-bold uppercase tracking-wider text-txt-secondary mb-6 text-brand-primary flex items-center gap-2">
              <Truck className="w-4 h-4" />
              Vehicle Specifications
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-8 gap-x-12">
              <div>
                <p className="text-xs font-bold text-txt-secondary uppercase tracking-wider mb-1">Classification Type</p>
                <p className="text-base font-semibold text-txt-primary">{vehicle.type}</p>
              </div>

              <div>
                <p className="text-xs font-bold text-txt-secondary uppercase tracking-wider mb-1">Region Location</p>
                <div className="flex items-center gap-1.5 text-base font-semibold text-txt-primary">
                  <MapPin className="w-4 h-4 text-brand-teal" />
                  {vehicle.region}
                </div>
              </div>

              <div>
                <p className="text-xs font-bold text-txt-secondary uppercase tracking-wider mb-1">Max Load Capacity</p>
                <p className="text-base font-mono font-semibold text-txt-primary">{vehicle.maxLoadCapacity.toLocaleString()} lbs</p>
              </div>

              <div>
                <p className="text-xs font-bold text-txt-secondary uppercase tracking-wider mb-1">Odometer</p>
                <p className="text-base font-mono font-semibold text-txt-primary">{vehicle.odometer.toLocaleString()} miles</p>
              </div>

              <div>
                <p className="text-xs font-bold text-txt-secondary uppercase tracking-wider mb-1">Acquisition Cost</p>
                <p className="text-base font-mono font-semibold text-txt-primary">${vehicle.acquisitionCost.toLocaleString()}</p>
              </div>

              <div>
                <p className="text-xs font-bold text-txt-secondary uppercase tracking-wider mb-1">Registration Date</p>
                <div className="flex items-center gap-1.5 text-base font-semibold text-txt-primary">
                  <Calendar className="w-4 h-4 text-txt-muted" />
                  {new Date(vehicle.createdAt).toLocaleDateString()}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
