import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const FREQUENCY_OPTIONS = [
  'Once per week',
  'Twice per week',
  'Three times per week',
  'Almost every day',
  'Every day',
];
const MEALS_OPTIONS = ['One', 'Two', 'Three', 'Four', 'Five'];

const initialForm = {
  phone: '',
  dateOfBirth: '',
  sex: '',
  occupation: '',
  county: '',
  residenceTown: '',
  height: '',
  weight: '',
  hasCurrentMedicalCondition: false,
  currentMedicalConditionDetails: '',
  hasFamilyMedicalHistory: false,
  familyMedicalHistoryDetails: '',
  balancedDietFrequency: '',
  fruitVegFrequency: '',
  fastFoodFrequency: '',
  mealsPerDay: '',
  physicalActivity: false,
  drugUse: false,
  drugUseDetails: '',
};

// Shown right after a Google sign-up, since Google only hands us name/email -
// this collects the same nutrition-profile fields the regular signup form does.
const CompleteProfile = () => {
  const { user, refreshUser } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(false);

  const update = (field, value) => setForm((f) => ({ ...f, [field]: value }));

  const validate = () => {
    if (!form.phone || !form.dateOfBirth || !form.sex || !form.occupation || !form.county || !form.residenceTown) {
      toast.error('Please fill in all personal information fields');
      return false;
    }
    if (new Date(form.dateOfBirth) >= new Date()) {
      toast.error('Date of birth cannot be in the future');
      return false;
    }
    if (!form.height || !form.weight) {
      toast.error('Please enter height and weight');
      return false;
    }
    if (form.height < 50 || form.height > 250) {
      toast.error('Height must be between 50cm and 250cm');
      return false;
    }
    if (form.weight < 10 || form.weight > 400) {
      toast.error('Weight must be between 10kg and 400kg');
      return false;
    }
    if (!form.balancedDietFrequency || !form.fruitVegFrequency || !form.fastFoodFrequency || !form.mealsPerDay) {
      toast.error('Please answer all dietary habit questions');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      await api.put('/auth/complete-profile', form);
      await refreshUser();
      toast.success('Profile completed!');
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not save your profile');
    } finally {
      setLoading(false);
    }
  };

  const heightM = Number(form.height) / 100;
  const liveBmi = form.height && form.weight ? Math.round((form.weight / (heightM * heightM)) * 10) / 10 : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-blue-50 py-8 px-4">
      <div className="card w-full max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-800 mb-1">Complete Your Profile</h1>
        <p className="text-sm text-gray-500 mb-6">
          {user?.fullName ? `Welcome, ${user.fullName}! ` : ''}
          We just need a few more details to personalize your nutrition counselling.
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="label-text">Phone Number (Kenyan)</label>
              <input
                placeholder="07XXXXXXXX"
                className="input-field"
                value={form.phone}
                onChange={(e) => update('phone', e.target.value)}
              />
            </div>
            <div>
              <label className="label-text">Date of Birth</label>
              <input
                type="date"
                max={new Date().toISOString().split('T')[0]}
                className="input-field"
                value={form.dateOfBirth}
                onChange={(e) => update('dateOfBirth', e.target.value)}
              />
            </div>
            <div>
              <label className="label-text">Sex</label>
              <select className="input-field" value={form.sex} onChange={(e) => update('sex', e.target.value)}>
                <option value="">Select</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
            </div>
            <div>
              <label className="label-text">Occupation</label>
              <input className="input-field" value={form.occupation} onChange={(e) => update('occupation', e.target.value)} />
            </div>
            <div>
              <label className="label-text">County</label>
              <input className="input-field" value={form.county} onChange={(e) => update('county', e.target.value)} />
            </div>
            <div>
              <label className="label-text">Residence / Town</label>
              <input className="input-field" value={form.residenceTown} onChange={(e) => update('residenceTown', e.target.value)} />
            </div>
            <div>
              <label className="label-text">Height (cm)</label>
              <input type="number" className="input-field" value={form.height} onChange={(e) => update('height', e.target.value)} />
            </div>
            <div>
              <label className="label-text">Weight (kg)</label>
              <input type="number" className="input-field" value={form.weight} onChange={(e) => update('weight', e.target.value)} />
            </div>
            {liveBmi && (
              <div className="sm:col-span-2 bg-primary-50 rounded-lg p-4 text-sm text-primary-800">
                Your calculated BMI will be <strong>{liveBmi}</strong>.
              </div>
            )}
          </div>

          <div className="space-y-4">
            <div>
              <label className="label-text">Do you have any current medical conditions?</label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="radio"
                    checked={!form.hasCurrentMedicalCondition}
                    onChange={() => update('hasCurrentMedicalCondition', false)}
                  />{' '}
                  No
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="radio"
                    checked={form.hasCurrentMedicalCondition}
                    onChange={() => update('hasCurrentMedicalCondition', true)}
                  />{' '}
                  Yes
                </label>
              </div>
              {form.hasCurrentMedicalCondition && (
                <textarea
                  className="input-field mt-2"
                  placeholder="Please specify"
                  value={form.currentMedicalConditionDetails}
                  onChange={(e) => update('currentMedicalConditionDetails', e.target.value)}
                />
              )}
            </div>

            <div>
              <label className="label-text">Family history of medical conditions?</label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="radio"
                    checked={!form.hasFamilyMedicalHistory}
                    onChange={() => update('hasFamilyMedicalHistory', false)}
                  />{' '}
                  No
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="radio"
                    checked={form.hasFamilyMedicalHistory}
                    onChange={() => update('hasFamilyMedicalHistory', true)}
                  />{' '}
                  Yes
                </label>
              </div>
              {form.hasFamilyMedicalHistory && (
                <textarea
                  className="input-field mt-2"
                  placeholder="Please specify"
                  value={form.familyMedicalHistoryDetails}
                  onChange={(e) => update('familyMedicalHistoryDetails', e.target.value)}
                />
              )}
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="label-text">How often do you eat a balanced diet?</label>
              <select
                className="input-field"
                value={form.balancedDietFrequency}
                onChange={(e) => update('balancedDietFrequency', e.target.value)}
              >
                <option value="">Select</option>
                {FREQUENCY_OPTIONS.map((o) => (
                  <option key={o} value={o}>
                    {o}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="label-text">How often do you eat fruits and vegetables?</label>
              <select
                className="input-field"
                value={form.fruitVegFrequency}
                onChange={(e) => update('fruitVegFrequency', e.target.value)}
              >
                <option value="">Select</option>
                {FREQUENCY_OPTIONS.map((o) => (
                  <option key={o} value={o}>
                    {o}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="label-text">How often do you consume fast foods, sugary drinks or fatty foods?</label>
              <select
                className="input-field"
                value={form.fastFoodFrequency}
                onChange={(e) => update('fastFoodFrequency', e.target.value)}
              >
                <option value="">Select</option>
                {FREQUENCY_OPTIONS.map((o) => (
                  <option key={o} value={o}>
                    {o}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="label-text">Meals per day</label>
              <select className="input-field" value={form.mealsPerDay} onChange={(e) => update('mealsPerDay', e.target.value)}>
                <option value="">Select</option>
                {MEALS_OPTIONS.map((o) => (
                  <option key={o} value={o}>
                    {o}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="label-text">Do you engage in physical activity?</label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 text-sm">
                  <input type="radio" checked={form.physicalActivity} onChange={() => update('physicalActivity', true)} /> Yes
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <input type="radio" checked={!form.physicalActivity} onChange={() => update('physicalActivity', false)} /> No
                </label>
              </div>
            </div>
            <div>
              <label className="label-text">Do you use drugs?</label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 text-sm">
                  <input type="radio" checked={form.drugUse} onChange={() => update('drugUse', true)} /> Yes
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <input type="radio" checked={!form.drugUse} onChange={() => update('drugUse', false)} /> No
                </label>
              </div>
              {form.drugUse && (
                <textarea
                  className="input-field mt-2"
                  placeholder="Please specify"
                  value={form.drugUseDetails}
                  onChange={(e) => update('drugUseDetails', e.target.value)}
                />
              )}
            </div>
          </div>

          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? 'Saving...' : 'Finish Setting Up My Account'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CompleteProfile;