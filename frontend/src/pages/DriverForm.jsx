import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { User, ArrowLeft, Save } from 'lucide-react';
import { toast } from 'react-hot-toast';
import api from '../services/api';

export default function DriverForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = Boolean(id);

  const [isLoading, setIsLoading] = useState(isEditing);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    mobile: '',
    profilePicture: '',
    licenseNumber: '',
    licenseCategory: 'CDL Class A (Active)',
    licenseExpiryDate: '',
    safetyScore: 100,
    status: 'Available'
  });

  useEffect(() => {
    if (isEditing) {
      fetchDriver();
    }
  }, [id]);

  const fetchDriver = async () => {
    try {
      setIsLoading(true);
      const res = await api.get(`/api/drivers/${id}`);
      if (res.data && res.data.success) {
        const d = res.data.data;
        setFormData({
          firstName: d.user?.firstName || '',
          lastName: d.user?.lastName || '',
          email: d.user?.email || '',
          mobile: d.user?.mobile || '',
          profilePicture: d.user?.profilePicture || '',
          licenseNumber: d.licenseNumber || '',
          licenseCategory: d.licenseCategory || 'CDL Class A (Active)',
          licenseExpiryDate: d.licenseExpiryDate ? new Date(d.licenseExpiryDate).toISOString().split('T')[0] : '',
          safetyScore: d.safetyScore || 100,
          status: d.status || 'Available'
        });
      }
    } catch (err) {
      console.error('Failed to fetch driver', err);
      toast.error('Failed to load driver details');
      navigate('/dashboard/drivers');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      setIsUploading(true);
      const data = new FormData();
      data.append('image', file);

      const res = await api.post('/api/upload', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (res.data && res.data.success) {
        setFormData(prev => ({ ...prev, profilePicture: res.data.data.url }));
        toast.success('Photo uploaded successfully');
      }
    } catch (err) {
      console.error('Upload failed', err);
      toast.error('Failed to upload photo');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.mobile || !formData.licenseNumber || !formData.licenseExpiryDate) {
      toast.error('Please enter all required fields.');
      return;
    }

    try {
      setIsSaving(true);
      if (isEditing) {
        await api.put(`/api/drivers/${id}`, formData);
        toast.success(`Driver updated successfully!`);
      } else {
        await api.post('/api/drivers', formData);
        toast.success(`Driver registered successfully!`);
      }
      navigate('/dashboard/drivers');
    } catch (err) {
      console.error('Failed to save driver', err);
      toast.error(err.response?.data?.message || 'Failed to save driver');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto font-sans pb-12">
      <div className="flex items-center gap-4">
        <Link 
          to="/dashboard/drivers" 
          className="p-2 bg-surface border border-border-custom text-txt-secondary hover:text-txt-primary rounded-xl transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h2 className="text-2xl font-bold text-txt-primary tracking-tight">
            {isEditing ? 'Edit Driver Profile' : 'Register New Driver'}
          </h2>
          <p className="text-sm text-txt-secondary mt-0.5">
            {isEditing ? 'Update the details and configuration of this driver.' : 'Add a new driver to your fleet registry.'}
          </p>
        </div>
      </div>

      <div className="bg-card-bg border border-border-custom rounded-3xl p-6 md:p-8 shadow-premium">
        <form onSubmit={handleSubmit} className="space-y-8">
          
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-txt-secondary mb-4 flex items-center gap-2">
              <User className="w-4 h-4 text-brand-primary" />
              Personal Details
            </h3>

            <div className="mb-6">
              <label className="block text-xs font-bold uppercase tracking-wider text-txt-secondary mb-2">
                Driver Photo
              </label>
              <div className="flex items-center gap-6">
                {formData.profilePicture ? (
                  <div className="w-24 h-24 rounded-full overflow-hidden border border-border-custom shrink-0 shadow-sm">
                    <img src={formData.profilePicture} alt="Driver" className="w-full h-full object-cover" />
                  </div>
                ) : (
                  <div className="w-24 h-24 rounded-full overflow-hidden border border-border-custom shrink-0 shadow-sm bg-surface flex items-center justify-center text-txt-secondary font-bold">
                    UN
                  </div>
                )}
                <div className="flex-1">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    disabled={isUploading}
                    className="block w-full text-sm text-txt-secondary
                      file:mr-4 file:py-2 file:px-4
                      file:rounded-full file:border-0
                      file:text-sm file:font-semibold
                      file:bg-brand-primary/10 file:text-brand-primary
                      hover:file:bg-brand-primary/20
                      disabled:opacity-50 cursor-pointer"
                  />
                  {isUploading && <p className="text-xs text-brand-primary mt-2">Uploading photo...</p>}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-txt-secondary mb-2">
                  First Name*
                </label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  required
                  className="w-full bg-surface border border-border-custom rounded-xl px-4 py-3 text-sm text-txt-primary focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition-all"
                  placeholder="e.g. John"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-txt-secondary mb-2">
                  Last Name*
                </label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  required
                  className="w-full bg-surface border border-border-custom rounded-xl px-4 py-3 text-sm text-txt-primary focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition-all"
                  placeholder="e.g. Doe"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-txt-secondary mb-2">
                  Email Address*
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  disabled={isEditing}
                  className="w-full bg-surface border border-border-custom rounded-xl px-4 py-3 text-sm text-txt-primary focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition-all disabled:opacity-50"
                  placeholder="e.g. john.doe@example.com"
                />
                {isEditing && <p className="text-xs text-txt-secondary mt-1">Email cannot be changed after registration.</p>}
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-txt-secondary mb-2">
                  Mobile Number*
                </label>
                <input
                  type="text"
                  name="mobile"
                  value={formData.mobile}
                  onChange={handleChange}
                  required
                  className="w-full bg-surface border border-border-custom rounded-xl px-4 py-3 text-sm text-txt-primary focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition-all"
                  placeholder="e.g. +1 555 123 4567"
                />
              </div>
            </div>
          </div>

          <div className="border-t border-border-custom/50 pt-8">
            <h3 className="text-sm font-bold uppercase tracking-wider text-txt-secondary mb-4 flex items-center gap-2">
              <User className="w-4 h-4 text-brand-primary" />
              License & Status
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-txt-secondary mb-2">
                  License Number*
                </label>
                <input
                  type="text"
                  name="licenseNumber"
                  value={formData.licenseNumber}
                  onChange={handleChange}
                  required
                  className="w-full bg-surface border border-border-custom rounded-xl px-4 py-3 text-sm text-txt-primary focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition-all uppercase"
                  placeholder="e.g. DL-123456"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-txt-secondary mb-2">
                  License Category*
                </label>
                <select
                  name="licenseCategory"
                  value={formData.licenseCategory}
                  onChange={handleChange}
                  className="w-full bg-surface border border-border-custom rounded-xl px-4 py-3 text-sm text-txt-primary focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition-all"
                >
                  <option value="CDL Class A (Active)">CDL Class A (Active)</option>
                  <option value="CDL Class B (Active)">CDL Class B (Active)</option>
                  <option value="CDL Class C (Active)">CDL Class C (Active)</option>
                  <option value="Non-Commercial (Active)">Non-Commercial (Active)</option>
                  <option value="CDL Class A (Expired)">CDL Class A (Expired)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-txt-secondary mb-2">
                  License Expiry Date*
                </label>
                <input
                  type="date"
                  name="licenseExpiryDate"
                  value={formData.licenseExpiryDate}
                  onChange={handleChange}
                  required
                  className="w-full bg-surface border border-border-custom rounded-xl px-4 py-3 text-sm text-txt-primary focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition-all [color-scheme:light] dark:[color-scheme:dark]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-txt-secondary mb-2">
                  Operational Status
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full bg-surface border border-border-custom rounded-xl px-4 py-3 text-sm text-txt-primary focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition-all"
                >
                  <option value="Available">Available</option>
                  <option value="On Trip">On Trip</option>
                  <option value="Off Duty">Off Duty</option>
                  <option value="Suspended">Suspended</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-txt-secondary mb-2">
                  Safety Score
                </label>
                <input
                  type="number"
                  name="safetyScore"
                  value={formData.safetyScore}
                  onChange={handleChange}
                  min="0"
                  max="100"
                  className="w-full bg-surface border border-border-custom rounded-xl px-4 py-3 text-sm text-txt-primary focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition-all"
                />
              </div>
            </div>
          </div>

          <div className="pt-6 flex items-center justify-end gap-3 border-t border-border-custom/50">
            <Link
              to="/dashboard/drivers"
              className="px-6 py-2.5 rounded-xl text-sm font-bold text-txt-secondary hover:text-txt-primary hover:bg-surface transition-all cursor-pointer"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={isSaving || isUploading}
              className="flex items-center gap-2 px-6 py-2.5 bg-brand-primary hover:bg-brand-primary/90 text-white rounded-xl text-sm font-bold shadow-md transition-all disabled:opacity-50 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              {isSaving ? 'Saving...' : 'Save Driver'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
