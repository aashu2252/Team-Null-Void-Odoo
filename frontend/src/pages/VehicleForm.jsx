import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { Truck, ArrowLeft, Save } from 'lucide-react';
import { toast } from 'react-hot-toast';
import api from '../services/api';

export default function VehicleForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = Boolean(id);

  const [isLoading, setIsLoading] = useState(isEditing);
  const [drivers, setDrivers] = useState([]);
  const [isSaving, setIsSaving] = useState(false);

  const [isUploading, setIsUploading] = useState(false);

  const [formData, setFormData] = useState({
    vehicleName: '',
    registrationNumber: '',
    model: '',
    type: 'Heavy Duty',
    region: 'East Coast',
    maxLoadCapacity: '',
    odometer: 0,
    acquisitionCost: '',
    status: 'Available',
    fuel: 100,
    health: 100,
    driver: '',
    image: ''
  });

  useEffect(() => {
    fetchDrivers();
    if (isEditing) {
      fetchVehicle();
    }
  }, [id]);

  const fetchDrivers = async () => {
    try {
      const res = await api.get('/api/drivers');
      if (res.data && res.data.success) {
        const data = res.data.data.drivers || res.data.data;
        setDrivers(data);
      }
    } catch (err) {
      console.error('Failed to fetch drivers', err);
      toast.error('Failed to load drivers for assignment');
    }
  };

  const fetchVehicle = async () => {
    try {
      setIsLoading(true);
      const res = await api.get(`/api/vehicles/${id}`);
      if (res.data && res.data.success) {
        const v = res.data.data;
        setFormData({
          vehicleName: v.vehicleName,
          registrationNumber: v.registrationNumber,
          model: v.model,
          type: v.type,
          region: v.region,
          maxLoadCapacity: v.maxLoadCapacity,
          odometer: v.odometer,
          acquisitionCost: v.acquisitionCost,
          status: v.status,
          fuel: v.fuel || 100,
          health: v.health || 100,
          driver: v.driver ? (v.driver._id || v.driver) : '',
          image: v.image || ''
        });
      }
    } catch (err) {
      console.error('Failed to fetch vehicle', err);
      toast.error('Failed to load vehicle details');
      navigate('/dashboard/vehicles');
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
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      if (res.data && res.data.success) {
        setFormData(prev => ({ ...prev, image: res.data.data.url }));
        toast.success('Image uploaded successfully');
      }
    } catch (err) {
      console.error('Upload failed', err);
      toast.error('Failed to upload image');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.vehicleName || !formData.model || !formData.maxLoadCapacity || !formData.registrationNumber || !formData.acquisitionCost) {
      toast.error('Please enter all required fields.');
      return;
    }

    const payload = {
      ...formData,
      vehicleName: formData.vehicleName.trim(),
      registrationNumber: formData.registrationNumber.trim(),
      model: formData.model.trim(),
      maxLoadCapacity: parseFloat(formData.maxLoadCapacity),
      odometer: parseFloat(formData.odometer) || 0,
      acquisitionCost: parseFloat(formData.acquisitionCost),
      fuel: parseFloat(formData.fuel) || 100,
      health: parseFloat(formData.health) || 100,
      driver: formData.driver || null,
      image: formData.image || ''
    };

    try {
      setIsSaving(true);
      if (isEditing) {
        await api.put(`/api/vehicles/${id}`, payload);
        toast.success(`Vehicle updated successfully!`);
      } else {
        await api.post('/api/vehicles', payload);
        toast.success(`Vehicle registered successfully!`);
      }
      navigate('/dashboard/vehicles');
    } catch (err) {
      console.error('Failed to save vehicle', err);
      toast.error(err.response?.data?.message || 'Failed to save vehicle');
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
          to="/dashboard/vehicles" 
          className="p-2 bg-surface border border-border-custom text-txt-secondary hover:text-txt-primary rounded-xl transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h2 className="text-2xl font-bold text-txt-primary tracking-tight">
            {isEditing ? 'Edit Vehicle Profile' : 'Register New Vehicle'}
          </h2>
          <p className="text-sm text-txt-secondary mt-0.5">
            {isEditing ? 'Update the details and configuration of this asset.' : 'Add a new vehicle to your fleet registry.'}
          </p>
        </div>
      </div>

      <div className="bg-card-bg border border-border-custom rounded-3xl p-6 md:p-8 shadow-premium">
        <form onSubmit={handleSubmit} className="space-y-8">
          
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-txt-secondary mb-4 flex items-center gap-2">
              <Truck className="w-4 h-4 text-brand-primary" />
              Identification Details
            </h3>

            <div className="mb-6">
              <label className="block text-xs font-bold uppercase tracking-wider text-txt-secondary mb-2">
                Vehicle Image
              </label>
              <div className="flex items-center gap-6">
                {formData.image && (
                  <div className="w-24 h-24 rounded-2xl overflow-hidden border border-border-custom shrink-0">
                    <img src={formData.image} alt="Vehicle" className="w-full h-full object-cover" />
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
                  {isUploading && <p className="text-xs text-brand-primary mt-2">Uploading image...</p>}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-txt-secondary mb-2">
                  Vehicle Name / Internal ID*
                </label>
                <input
                  type="text"
                  name="vehicleName"
                  required
                  value={formData.vehicleName}
                  onChange={(e) => handleChange({ target: { name: 'vehicleName', value: e.target.value.toUpperCase() } })}
                  placeholder="e.g. VH-107"
                  className="w-full bg-surface dark:bg-card-elevated border border-border-custom/80 rounded-xl px-4 py-3 text-sm font-semibold text-txt-primary focus:outline-none focus:border-brand-primary transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-txt-secondary mb-2">
                  Registration Number*
                </label>
                <input
                  type="text"
                  name="registrationNumber"
                  required
                  value={formData.registrationNumber}
                  onChange={(e) => handleChange({ target: { name: 'registrationNumber', value: e.target.value.toUpperCase() } })}
                  placeholder="e.g. NJ-992-ABC"
                  className="w-full bg-surface dark:bg-card-elevated border border-border-custom/80 rounded-xl px-4 py-3 text-sm font-semibold text-txt-primary focus:outline-none focus:border-brand-primary transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-txt-secondary mb-2">
                  Manufacturer & Model*
                </label>
                <input
                  type="text"
                  name="model"
                  required
                  value={formData.model}
                  onChange={handleChange}
                  placeholder="e.g. Volvo FH16"
                  className="w-full bg-surface dark:bg-card-elevated border border-border-custom/80 rounded-xl px-4 py-3 text-sm font-semibold text-txt-primary focus:outline-none focus:border-brand-primary transition-colors"
                />
              </div>
            </div>
          </div>

          <hr className="border-border-custom/50" />

          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-txt-secondary mb-4 text-brand-teal">
              Specifications & Region
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-txt-secondary mb-2">
                  Classification Type
                </label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  className="w-full bg-surface dark:bg-card-elevated border border-border-custom/80 text-txt-primary font-semibold px-4 py-3 rounded-xl text-sm focus:outline-none transition-colors"
                >
                  <option value="Heavy Duty">Heavy Duty</option>
                  <option value="Box Truck">Box Truck</option>
                  <option value="Flatbed">Flatbed</option>
                  <option value="Refrigerated">Refrigerated</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-txt-secondary mb-2">
                  Max Load Capacity (lbs)*
                </label>
                <input
                  type="number"
                  name="maxLoadCapacity"
                  required
                  value={formData.maxLoadCapacity}
                  onChange={handleChange}
                  placeholder="e.g. 24000"
                  className="w-full bg-surface dark:bg-card-elevated border border-border-custom/80 rounded-xl px-4 py-3 text-sm font-mono font-semibold text-txt-primary focus:outline-none focus:border-brand-primary transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-txt-secondary mb-2">
                  Region Location*
                </label>
                <input
                  type="text"
                  name="region"
                  required
                  value={formData.region}
                  onChange={handleChange}
                  placeholder="e.g. East Coast"
                  className="w-full bg-surface dark:bg-card-elevated border border-border-custom/80 rounded-xl px-4 py-3 text-sm font-semibold text-txt-primary focus:outline-none focus:border-brand-primary transition-colors"
                />
              </div>
            </div>
          </div>

          <hr className="border-border-custom/50" />

          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-txt-secondary mb-4 text-brand-orange">
              Operational Status & Metrics
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-txt-secondary mb-2">
                  Current Status
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full bg-surface dark:bg-card-elevated border border-border-custom/80 text-txt-primary font-semibold px-4 py-3 rounded-xl text-sm focus:outline-none transition-colors"
                >
                  <option value="Available">Available</option>
                  <option value="On Trip">On Trip</option>
                  <option value="In Shop">In Shop</option>
                  <option value="Retired">Retired</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-txt-secondary mb-2">
                  Assigned Driver
                </label>
                <select
                  name="driver"
                  value={formData.driver}
                  onChange={handleChange}
                  className="w-full bg-surface dark:bg-card-elevated border border-border-custom/80 text-txt-primary font-semibold px-4 py-3 rounded-xl text-sm focus:outline-none transition-colors"
                >
                  <option value="">Unassigned</option>
                  {drivers.map(d => (
                    <option key={d._id} value={d._id}>
                      {d.user ? `${d.user.firstName} ${d.user.lastName}` : d.name} ({d.licenseNumber})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-txt-secondary mb-2">
                  Fuel Level (%)
                </label>
                <input
                  type="number"
                  name="fuel"
                  min="0"
                  max="100"
                  value={formData.fuel}
                  onChange={handleChange}
                  className="w-full bg-surface dark:bg-card-elevated border border-border-custom/80 rounded-xl px-4 py-3 text-sm font-mono font-semibold text-txt-primary focus:outline-none focus:border-brand-primary transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-txt-secondary mb-2">
                  Health Score (%)
                </label>
                <input
                  type="number"
                  name="health"
                  min="0"
                  max="100"
                  value={formData.health}
                  onChange={handleChange}
                  className="w-full bg-surface dark:bg-card-elevated border border-border-custom/80 rounded-xl px-4 py-3 text-sm font-mono font-semibold text-txt-primary focus:outline-none focus:border-brand-primary transition-colors"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-txt-secondary mb-2">
                  Odometer (mi)
                </label>
                <input
                  type="number"
                  name="odometer"
                  value={formData.odometer}
                  onChange={handleChange}
                  className="w-full bg-surface dark:bg-card-elevated border border-border-custom/80 rounded-xl px-4 py-3 text-sm font-mono font-semibold text-txt-primary focus:outline-none focus:border-brand-primary transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-txt-secondary mb-2">
                  Acquisition Cost ($)*
                </label>
                <input
                  type="number"
                  name="acquisitionCost"
                  required
                  value={formData.acquisitionCost}
                  onChange={handleChange}
                  placeholder="e.g. 120000"
                  className="w-full bg-surface dark:bg-card-elevated border border-border-custom/80 rounded-xl px-4 py-3 text-sm font-mono font-semibold text-txt-primary focus:outline-none focus:border-brand-primary transition-colors"
                />
              </div>
            </div>
          </div>

          <div className="pt-8 flex items-center justify-end gap-4">
            <Link 
              to="/dashboard/vehicles"
              className="px-6 py-3 bg-surface hover:bg-surface/80 text-txt-primary border border-border-custom rounded-xl text-sm font-bold transition-colors cursor-pointer"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={isSaving}
              className="flex items-center gap-2 px-8 py-3 bg-brand-primary hover:bg-brand-primary/90 text-white rounded-xl text-sm font-bold shadow-lg shadow-brand-primary/20 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save className="w-5 h-5" />
              <span>{isSaving ? 'Saving...' : 'Save Vehicle'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
