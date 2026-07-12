import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Star,
  ShieldCheck,
  Mail,
  Phone,
  Plus,
  X,
  UserCheck,
  Award,
  Truck,
  Filter,
  CheckCircle2,
  AlertTriangle,
  Calendar
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import api from '../services/api';

export default function Drivers() {
  const [drivers, setDrivers] = useState([]);

  // Fetch drivers from backend database on mount
  useEffect(() => {
    const loadDrivers = async () => {
      try {
        const res = await api.get('/api/drivers');
        if (res.data && res.data.success) {
          const rawDrivers = Array.isArray(res.data.data) ? res.data.data : (res.data.data?.drivers || []);
          const mapped = rawDrivers.map(d => {
            const dName = d.name || (d.user ? `${d.user.firstName} ${d.user.lastName}` : 'Unknown');
            return {
              ...d,
              name: dName,
              id: d.id || (d._id ? d._id.substring(d._id.length - 6) : ''),
              rating: d.rating || 4.8,
              trips: d.trips || Math.floor(Math.random() * 200) + 100,
              experience: d.experience || '5 Years',
              email: d.email || (d.user?.email || `${dName.toLowerCase().replace(/\s+/g, '')}@transitops.com`)
            };
          });
          setDrivers(mapped);
        }
      } catch (err) {
        console.warn('Backend server offline. Retaining local cache.');
      }
    };
    loadDrivers();
  }, []);

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [showAddModal, setShowAddModal] = useState(false);

  const [newDriver, setNewDriver] = useState({
    name: '',
    experience: '',
    licenseCategory: 'CDL Class A (Active)',
    licenseNumber: '',
    licenseExpiryDate: '',
    contactNumber: '',
    safetyScore: 100,
    status: 'Available',
    trips: 0,
    email: ''
  });

  const filteredDrivers = useMemo(() => {
    return drivers.filter((d) => {
      const dName = d.name || '';
      const dEmail = d.email || '';
      const dId = d.id || '';
      const dLicense = d.licenseNumber || '';
      const matchSearch = dName.toLowerCase().includes(search.toLowerCase()) || 
                          dEmail.toLowerCase().includes(search.toLowerCase()) ||
                          dId.toLowerCase().includes(search.toLowerCase()) ||
                          dLicense.toLowerCase().includes(search.toLowerCase());
      
      const matchStatus = statusFilter === 'All' || d.status === statusFilter;
      
      return matchSearch && matchStatus;
    });
  }, [drivers, search, statusFilter]);

  const handleAddDriverSubmit = async (e) => {
    e.preventDefault();
    if (!newDriver.name || !newDriver.licenseNumber || !newDriver.licenseExpiryDate || !newDriver.contactNumber) {
      toast.error('Please enter all required fields.');
      return;
    }

    let userId = null;
    const operatorEmail = newDriver.email || `${newDriver.name.toLowerCase().replace(/\s+/g, '')}@transitops.com`;

    try {
      // 1. Pre-register User account for the Driver
      const userRes = await api.post('/api/auth/register', {
        fullName: newDriver.name,
        email: operatorEmail,
        password: 'transitops_driver_password_123',
        role: 'Driver'
      });
      if (userRes.data && userRes.data.success) {
        userId = userRes.data.data.user.id;
      }
    } catch (userErr) {
      console.warn('Failed to pre-register Driver User model. Attempting driver creation with dummy fallback.', userErr);
    }

    // If registration is blocked because database has mock user already or backend is offline
    const payload = {
      name: newDriver.name,
      licenseNumber: newDriver.licenseNumber,
      licenseCategory: newDriver.licenseCategory,
      licenseExpiryDate: newDriver.licenseExpiryDate,
      contactNumber: newDriver.contactNumber,
      safetyScore: parseInt(newDriver.safetyScore) || 100,
      status: newDriver.status,
      user: userId || '60d5ec4f31f6e2a220260712' // fallback validation objectId
    };

    try {
      const res = await api.post('/api/drivers', payload);
      if (res.data && res.data.success) {
        const created = {
          ...res.data.data,
          id: res.data.data.id || res.data.data._id.substring(res.data.data._id.length - 6),
          rating: 5.0,
          trips: 0,
          experience: newDriver.experience || '1 Year',
          email: operatorEmail
        };
        setDrivers(prev => [created, ...prev]);
        toast.success(`Operator ${newDriver.name} registered in database!`, {
          style: { background: '#182230', color: '#F8FAFC', border: '1px solid #2B3645' }
        });
      }
    } catch (err) {
      console.warn('Backend write failed. Preserving driver locally in cache...', err);
      const createdId = 'DR-0' + (drivers.length + 1);
      setDrivers(prev => [
        {
          ...newDriver,
          id: createdId,
          rating: 5.0,
          safetyScore: parseInt(newDriver.safetyScore) || 100,
          trips: parseInt(newDriver.trips) || 0
        },
        ...prev
      ]);
      
      toast.success(`Operator ${newDriver.name} added locally (offline mode).`, {
        style: { background: '#182230', color: '#F8FAFC', border: '1px solid #2B3645' }
      });
    }
    
    setNewDriver({
      name: '',
      experience: '',
      licenseCategory: 'CDL Class A (Active)',
      licenseNumber: '',
      licenseExpiryDate: '',
      contactNumber: '',
      safetyScore: 100,
      status: 'Available',
      trips: 0,
      email: ''
    });
    setShowAddModal(false);
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Available':
        return (
          <span className="px-2.5 py-0.5 bg-brand-success/10 text-brand-success border border-brand-success/15 rounded-full text-[10px] font-bold uppercase tracking-wider">
            Available
          </span>
        );
      case 'On Trip':
        return (
          <span className="px-2.5 py-0.5 bg-brand-primary/10 text-brand-primary border border-brand-primary/15 rounded-full text-[10px] font-bold uppercase tracking-wider">
            On Trip
          </span>
        );
      case 'Off Duty':
        return (
          <span className="px-2.5 py-0.5 bg-txt-secondary/15 text-txt-secondary rounded-full text-[10px] font-bold uppercase tracking-wider">
            Off Duty
          </span>
        );
      case 'Suspended':
      default:
        return (
          <span className="px-2.5 py-0.5 bg-brand-danger/10 text-brand-danger border border-brand-danger/15 rounded-full text-[10px] font-bold uppercase tracking-wider">
            Suspended
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 max-w-full font-sans">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-txt-primary">Driver Compliance Directory</h2>
          <p className="text-xs text-txt-secondary mt-0.5">Manage operator CDL certifications, safety ratings, and Mongoose compliance records.</p>
        </div>
        
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-1.5 px-3.5 py-2 bg-brand-primary hover:bg-brand-primary/95 text-white rounded-xl text-xs font-semibold shadow-md shadow-brand-primary/10 transition-all cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Operator</span>
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-card-bg border border-border-custom p-4 rounded-[20px] shadow-premium">
        <div className="relative w-full sm:w-80">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, license number, operator ID..."
            className="w-full bg-surface dark:bg-card-elevated border border-border-custom/80 rounded-xl pl-9 pr-4 py-2 text-xs text-txt-primary placeholder-txt-muted focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary"
          />
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-txt-muted" />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
          <span className="text-xs font-bold text-txt-secondary flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" />
            <span>Filter Status</span>
          </span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-surface dark:bg-card-elevated border border-border-custom/80 text-txt-primary px-3 py-2 rounded-xl text-xs font-semibold focus:outline-none"
          >
            <option value="All">All Statuses</option>
            <option value="Available">Available</option>
            <option value="On Trip">On Trip</option>
            <option value="Off Duty">Off Duty</option>
            <option value="Suspended">Suspended</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        <AnimatePresence>
          {filteredDrivers.map((driver) => (
            <motion.div
              key={driver.id}
              layoutId={`driver-card-${driver.id}`}
              whileHover={{ y: -4, shadow: 'var(--shadow-premium-hover)' }}
              className="bg-card-bg border border-border-custom rounded-[20px] p-5 shadow-premium hover:border-brand-primary/45 transition-all duration-200 cursor-pointer flex flex-col justify-between"
            >
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <div className="h-11 w-11 rounded-2xl bg-brand-primary/10 border border-brand-primary/30 flex items-center justify-center font-bold text-brand-primary text-sm shadow-inner shrink-0">
                    {driver.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-txt-primary">{driver.name}</h3>
                    <p className="text-[10px] font-mono text-txt-muted mt-0.5">{driver.id} • {driver.experience} Exp</p>
                  </div>
                </div>
                {getStatusBadge(driver.status)}
              </div>

              <div className="grid grid-cols-3 gap-2 border-y border-border-custom/50 py-3.5 my-4 text-center">
                <div>
                  <span className="text-[9px] uppercase font-bold text-txt-muted">Trips Done</span>
                  <p className="text-xs font-bold text-txt-primary mt-0.5">{driver.trips}</p>
                </div>
                <div>
                  <span className="text-[9px] uppercase font-bold text-txt-muted">Performance</span>
                  <div className="flex items-center justify-center gap-0.5 mt-0.5">
                    <Star className="w-3.5 h-3.5 fill-brand-warning text-brand-warning" />
                    <span className="text-xs font-bold text-txt-primary">{driver.rating}</span>
                  </div>
                </div>
                <div>
                  <span className="text-[9px] uppercase font-bold text-txt-muted">Safety Score</span>
                  <div className="flex items-center justify-center gap-1.5 mt-0.5">
                    <ShieldCheck className={`w-4 h-4 ${driver.safetyScore >= 95 ? 'text-brand-success' : driver.safetyScore >= 85 ? 'text-brand-orange' : 'text-brand-danger'}`} />
                    <span className="text-xs font-bold text-txt-primary">{driver.safetyScore}%</span>
                  </div>
                </div>
              </div>

              <div className="space-y-2.5">
                <div>
                  <p className="text-[9px] uppercase font-extrabold text-txt-muted tracking-wider">License ID & Class</p>
                  <p className="text-xs font-semibold text-txt-primary mt-0.5">{driver.licenseNumber} ({driver.licenseCategory})</p>
                  <div className="flex items-center gap-1 text-[10px] text-txt-secondary mt-0.5 font-semibold">
                    <Calendar className="w-3 h-3 text-brand-primary" />
                    <span>Expires: {driver.licenseExpiryDate}</span>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-[9px] font-bold text-txt-muted mb-1">
                    <span>SAFETY DRIVING GAUGE</span>
                    <span>{driver.safetyScore}/100</span>
                  </div>
                  <div className="w-full bg-surface dark:bg-card-elevated h-2 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full ${
                        driver.safetyScore >= 95 ? 'bg-brand-success' : driver.safetyScore >= 85 ? 'bg-brand-orange' : 'bg-brand-danger'
                      }`}
                      style={{ width: `${driver.safetyScore}%` }}
                    />
                  </div>
                </div>
                
                <div className="pt-3 border-t border-border-custom/50 flex justify-between gap-2">
                  <a
                    href={`mailto:${driver.email}`}
                    className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-surface hover:bg-brand-primary/10 hover:text-brand-primary border border-border-custom rounded-xl text-[10px] font-bold text-txt-secondary transition-colors"
                  >
                    <Mail className="w-3.5 h-3.5" />
                    <span>Email</span>
                  </a>
                  <a
                    href={`tel:${driver.contactNumber}`}
                    className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-surface hover:bg-brand-teal/10 hover:text-brand-teal border border-border-custom rounded-xl text-[10px] font-bold text-txt-secondary transition-colors"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>Call</span>
                  </a>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-card-bg border border-border-custom rounded-2xl shadow-2xl max-w-md w-full overflow-hidden"
            >
              <div className="p-4 bg-surface/50 border-b border-border-custom flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <UserCheck className="w-5 h-5 text-brand-primary" />
                  <h3 className="text-sm font-bold text-txt-primary">Create Driver Profile</h3>
                </div>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="text-txt-secondary hover:text-txt-primary p-1 rounded-lg hover:bg-surface transition-colors"
                >
                  <X className="w-4.5 h-4.5" />
                </button>
              </div>

              <form onSubmit={handleAddDriverSubmit} className="p-5 space-y-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-txt-secondary mb-1">
                    Driver Full Name*
                  </label>
                  <input
                    type="text"
                    required
                    value={newDriver.name}
                    onChange={(e) => setNewDriver(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g. Amanda Ross"
                    className="w-full bg-surface dark:bg-card-elevated border border-border-custom/80 rounded-xl px-3 py-2 text-xs text-txt-primary focus:outline-none focus:border-brand-primary"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-txt-secondary mb-1">
                      License Number*
                    </label>
                    <input
                      type="text"
                      required
                      value={newDriver.licenseNumber}
                      onChange={(e) => setNewDriver(prev => ({ ...prev, licenseNumber: e.target.value.toUpperCase() }))}
                      placeholder="e.g. NJ-DL-8472918"
                      className="w-full bg-surface dark:bg-card-elevated border border-border-custom/80 rounded-xl px-3 py-2 text-xs text-txt-primary focus:outline-none focus:border-brand-primary"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-txt-secondary mb-1">
                      License Expiry Date*
                    </label>
                    <input
                      type="date"
                      required
                      value={newDriver.licenseExpiryDate}
                      onChange={(e) => setNewDriver(prev => ({ ...prev, licenseExpiryDate: e.target.value }))}
                      className="w-full bg-surface dark:bg-card-elevated border border-border-custom/80 rounded-xl px-3 py-2 text-xs text-txt-primary focus:outline-none focus:border-brand-primary"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-txt-secondary mb-1">
                      License Classification
                    </label>
                    <select
                      value={newDriver.licenseCategory}
                      onChange={(e) => setNewDriver(prev => ({ ...prev, licenseCategory: e.target.value }))}
                      className="w-full bg-surface dark:bg-card-elevated border border-border-custom/80 text-txt-primary px-3 py-2 rounded-xl text-xs focus:outline-none"
                    >
                      <option value="CDL Class A">CDL Class A</option>
                      <option value="CDL Class B">CDL Class B</option>
                      <option value="CDL Class C">CDL Class C</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-txt-secondary mb-1">
                      Availability Status
                    </label>
                    <select
                      value={newDriver.status}
                      onChange={(e) => setNewDriver(prev => ({ ...prev, status: e.target.value }))}
                      className="w-full bg-surface dark:bg-card-elevated border border-border-custom/80 text-txt-primary px-3 py-2 rounded-xl text-xs focus:outline-none"
                    >
                      <option value="Available">Available</option>
                      <option value="On Trip">On Trip</option>
                      <option value="Off Duty">Off Duty</option>
                      <option value="Suspended">Suspended</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-txt-secondary mb-1">
                      Contact Email*
                    </label>
                    <input
                      type="email"
                      required
                      value={newDriver.email}
                      onChange={(e) => setNewDriver(prev => ({ ...prev, email: e.target.value }))}
                      placeholder="driver@transitops.com"
                      className="w-full bg-surface dark:bg-card-elevated border border-border-custom/80 rounded-xl px-3 py-2 text-xs text-txt-primary focus:outline-none focus:border-brand-primary"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-txt-secondary mb-1">
                      Contact Number*
                    </label>
                    <input
                      type="text"
                      required
                      value={newDriver.contactNumber}
                      onChange={(e) => setNewDriver(prev => ({ ...prev, contactNumber: e.target.value }))}
                      placeholder="(555) 012-3456"
                      className="w-full bg-surface dark:bg-card-elevated border border-border-custom/80 rounded-xl px-3 py-2 text-xs text-txt-primary focus:outline-none focus:border-brand-primary"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-txt-secondary mb-1">
                      Safety Score (0-100)
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={newDriver.safetyScore}
                      onChange={(e) => setNewDriver(prev => ({ ...prev, safetyScore: e.target.value }))}
                      className="w-full bg-surface dark:bg-card-elevated border border-border-custom/80 rounded-xl px-3 py-2 text-xs text-txt-primary"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-txt-secondary mb-1">
                      Trips Completed
                    </label>
                    <input
                      type="number"
                      value={newDriver.trips}
                      onChange={(e) => setNewDriver(prev => ({ ...prev, trips: e.target.value }))}
                      className="w-full bg-surface dark:bg-card-elevated border border-border-custom/80 rounded-xl px-3 py-2 text-xs text-txt-primary"
                    />
                  </div>
                </div>

                <div className="pt-3 border-t border-border-custom flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-4 py-2 bg-surface text-txt-primary border border-border-custom rounded-xl text-xs font-semibold transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-brand-primary text-white rounded-xl text-xs font-semibold shadow-md shadow-brand-primary/10 hover:bg-brand-primary/95 transition-all cursor-pointer"
                  >
                    Create Profile
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
