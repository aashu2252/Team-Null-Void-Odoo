import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, User, MapPin, Gauge, Activity, DollarSign, Calendar, Edit, Trash2, Mail, Phone, Award, ShieldCheck } from 'lucide-react';
import api from '../services/api';
import { toast } from 'react-hot-toast';

export default function DriverDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [driver, setDriver] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchDriver();
  }, [id]);

  const fetchDriver = async () => {
    try {
      setIsLoading(true);
      const res = await api.get('/api/drivers/' + id);
      if (res.data && res.data.success) {
        setDriver(res.data.data);
      }
    } catch (err) {
      toast.error('Failed to load driver details');
      navigate('/dashboard/drivers');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this driver?')) {
      try {
        await api.delete('/api/drivers/' + id);
        toast.success('Driver deleted successfully');
        navigate('/dashboard/drivers');
      } catch (err) {
        toast.error('Failed to delete driver');
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

  if (!driver) return null;

  return (
    <div className="space-y-6 max-w-6xl mx-auto font-sans pb-12">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            to="/dashboard/drivers"
            className="p-2 bg-surface border border-border-custom text-txt-secondary hover:text-txt-primary rounded-xl transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h2 className="text-2xl font-bold text-txt-primary tracking-tight">Driver Details</h2>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to={`/dashboard/drivers/${id}/edit`}
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Profile Card */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-card-bg border border-border-custom rounded-3xl p-6 shadow-premium flex flex-col items-center text-center">
            {driver.user?.profilePicture ? (
              <img src={driver.user.profilePicture} alt="Driver" className="w-32 h-32 rounded-full object-cover mb-4 shadow-sm border-4 border-surface" />
            ) : (
              <div className="w-32 h-32 rounded-full bg-brand-primary/10 text-brand-primary flex items-center justify-center font-bold text-4xl mb-4 shadow-sm border-4 border-surface">
                {driver.user ? driver.user.firstName.substring(0, 2).toUpperCase() : 'DR'}
              </div>
            )}
            <h3 className="text-xl font-bold text-txt-primary">
              {driver.user ? `${driver.user.firstName} ${driver.user.lastName}` : 'Unknown Driver'}
            </h3>
            <p className="text-sm font-semibold text-txt-secondary mt-1">{driver.licenseCategory} Driver</p>

            <div className="w-full mt-6 space-y-4 text-left border-t border-border-custom/50 pt-6">
              <div className="flex items-center gap-3">
                <Mail className="w-4.5 h-4.5 text-brand-primary" />
                <span className="text-sm font-semibold text-txt-primary">{driver.user?.email || 'N/A'}</span>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="w-4.5 h-4.5 text-brand-primary" />
                <span className="text-sm font-semibold text-txt-primary">{driver.user?.mobile || 'N/A'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Detailed Specs & Status */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-card-bg border border-border-custom rounded-3xl p-6 md:p-8 shadow-premium">
            <h3 className="text-sm font-bold uppercase tracking-wider text-txt-secondary mb-6 text-brand-primary flex items-center gap-2">
              <Activity className="w-4 h-4" />
              Status & Safety
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-8 gap-x-12">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-txt-secondary mb-3">Operational Status</p>
                <span className={`inline-flex px-3 py-1 text-sm font-bold rounded-lg border ${driver.status === 'Available' ? 'bg-brand-success/10 text-brand-success border-brand-success/20' : driver.status === 'Suspended' ? 'bg-brand-danger/10 text-brand-danger border-brand-danger/20' : 'bg-brand-warning/10 text-brand-warning border-brand-warning/20'}`}>
                  {driver.status}
                </span>
              </div>
              
              <div>
                <div className="flex justify-between text-sm font-bold text-txt-primary mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-txt-secondary">Safety Score</span>
                  <span>{driver.safetyScore} / 100</span>
                </div>
                <div className="w-full bg-surface dark:bg-card-elevated h-2.5 rounded-full overflow-hidden mt-1">
                  <div
                    className={`h-full rounded-full ${driver.safetyScore <= 70 ? 'bg-brand-danger' : driver.safetyScore <= 90 ? 'bg-brand-orange' : 'bg-brand-success'}`}
                    style={{ width: `${driver.safetyScore}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-card-bg border border-border-custom rounded-3xl p-6 md:p-8 shadow-premium">
            <h3 className="text-sm font-bold uppercase tracking-wider text-txt-secondary mb-6 text-brand-primary flex items-center gap-2">
              <ShieldCheck className="w-4 h-4" />
              License & Certifications
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-8 gap-x-12">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-txt-secondary mb-2">License Number</p>
                <div className="inline-flex items-center justify-center px-3 py-1 bg-yellow-400 border border-black rounded shadow-sm">
                  <span className="text-black font-mono font-bold tracking-widest uppercase text-sm">
                    {driver.licenseNumber}
                  </span>
                </div>
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-txt-secondary mb-1">License Category</p>
                <p className="text-base font-bold text-txt-primary mt-1">{driver.licenseCategory}</p>
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-txt-secondary mb-1">Expiry Date</p>
                <p className="text-base font-bold text-txt-primary mt-1">{new Date(driver.licenseExpiryDate).toLocaleDateString()}</p>
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-txt-secondary mb-1">Added On</p>
                <p className="text-base font-bold text-txt-primary mt-1">{new Date(driver.createdAt).toLocaleDateString()}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
