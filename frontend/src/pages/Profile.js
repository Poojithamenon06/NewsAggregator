import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { updateProfile, changePassword } from '../services/api';
import toast from 'react-hot-toast';
import './Profile.css';

function initials(n=''){return n.split(' ').map(w=>w[0]).join('').toUpperCase().slice(0,2);}
function avatarBg(n=''){const c=['#c0392b','#8e44ad','#2980b9','#27ae60','#d35400'];let h=0;for(const ch of n)h=ch.charCodeAt(0)+((h<<5)-h);return c[Math.abs(h)%c.length];}

export default function Profile() {
  const nav = useNavigate();
  const { user, logout, updateUser } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [curr, setCurr] = useState(''); const [nPwd, setNPwd] = useState(''); const [cPwd, setCPwd] = useState('');
  const [saving, setSaving] = useState(false);

  if (!user) { nav('/auth'); return null; }

  const saveProfile = async (e) => {
    e.preventDefault(); setSaving(true);
    try { const d = await updateProfile({ name }); updateUser(d.user); toast.success('Profile updated'); }
    catch (e) { toast.error(e.response?.data?.error || 'Failed'); }
    finally { setSaving(false); }
  };

  const savePwd = async (e) => {
    e.preventDefault();
    if (nPwd !== cPwd) { toast.error('Passwords do not match'); return; }
    setSaving(true);
    try { await changePassword({ currentPassword: curr, newPassword: nPwd }); toast.success('Password changed'); setCurr(''); setNPwd(''); setCPwd(''); }
    catch (e) { toast.error(e.response?.data?.error || 'Failed'); }
    finally { setSaving(false); }
  };

  return (
    <div className="profile-page">
      <div className="profile-header">
        <div className="ph-avatar" style={{ background: avatarBg(user.name) }}>{initials(user.name)}</div>
        <div>
          <h1 className="ph-name">{user.name}</h1>
          <p className="ph-email">{user.email}</p>
        </div>
      </div>
      <div className="profile-rule" />

      <div className="profile-body">
        <div className="profile-card">
          <h3>Edit Profile</h3>
          <form onSubmit={saveProfile} className="pf-form">
            <div className="pf-field"><label>Full Name</label><input value={name} onChange={e => setName(e.target.value)} /></div>
            <div className="pf-field"><label>Email</label><input value={user.email} disabled /></div>
            <button type="submit" className="pf-btn" disabled={saving}>{saving ? 'Saving…' : 'Save Changes'}</button>
          </form>
        </div>
        <div className="profile-card">
          <h3>Change Password</h3>
          <form onSubmit={savePwd} className="pf-form">
            <div className="pf-field"><label>Current Password</label><input type="password" value={curr} onChange={e => setCurr(e.target.value)} required /></div>
            <div className="pf-field"><label>New Password</label><input type="password" value={nPwd} onChange={e => setNPwd(e.target.value)} required /></div>
            <div className="pf-field"><label>Confirm New Password</label><input type="password" value={cPwd} onChange={e => setCPwd(e.target.value)} required /></div>
            <button type="submit" className="pf-btn" disabled={saving}>{saving ? 'Saving…' : 'Update Password'}</button>
          </form>
        </div>
      </div>

      <button className="profile-logout" onClick={() => { logout(); nav('/auth'); }}>Sign Out</button>
    </div>
  );
}
