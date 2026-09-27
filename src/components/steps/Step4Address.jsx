import { useEffect, useState } from 'react';
import { useFormContext, Controller } from 'react-hook-form';
import { Home, AlertCircle, Building, CheckCircle2, Loader2 } from 'lucide-react';
import Input from '../common/Input';
import Select from '../common/Select';
import Checkbox from '../common/Checkbox';
import CurrencyInput from '../common/CurrencyInput';
import { usePinCodeLookup } from '../../hooks/usePinCodeLookup';

const Step4Address = () => {
  const {
    register,
    control,
    watch,
    setValue,
    formState: { errors },
  } = useFormContext();

  const pinCode = watch('pinCode');
  const enteredState = watch('state');
  const residenceType = watch('residenceType');
  const yearsAtCurrent = watch('yearsAtCurrentAddress');
  const sameAsPermanent = watch('sameAsPermanent') ?? true;

  // Permanent PIN watcher
  const permPinCode = watch('permanentPinCode');

  // Lookups
  const pinLookup = usePinCodeLookup(pinCode);
  const permPinLookup = usePinCodeLookup(permPinCode);

  const [stateMismatchWarning, setStateMismatchWarning] = useState(null);

  // Auto-fill Current Address from PIN code
  useEffect(() => {
    if (pinLookup.city) {
      setValue('city', pinLookup.city, { shouldValidate: true });
    }
    if (pinLookup.state) {
      setValue('state', pinLookup.state, { shouldValidate: true });
    }
  }, [pinLookup.city, pinLookup.state, setValue]);

  // Check state mismatch
  useEffect(() => {
    if (pinLookup.state && enteredState && pinLookup.state.toLowerCase() !== enteredState.toLowerCase()) {
      setStateMismatchWarning(`Selected state (${enteredState}) does not match PIN code directory (${pinLookup.state}).`);
    } else {
      setStateMismatchWarning(null);
    }
  }, [pinLookup.state, enteredState]);

  // Auto-fill Permanent Address from Permanent PIN
  useEffect(() => {
    if (!sameAsPermanent) {
      if (permPinLookup.city) {
        setValue('permanentCity', permPinLookup.city, { shouldValidate: true });
      }
      if (permPinLookup.state) {
        setValue('permanentState', permPinLookup.state, { shouldValidate: true });
      }
    }
  }, [sameAsPermanent, permPinLookup.city, permPinLookup.state, setValue]);

  return (
    <div className="space-y-6">
      <div className="border-b border-slate-200 pb-4">
        <h2 className="text-xl font-bold text-slate-900">Residential Address Details</h2>
        <p className="text-sm text-slate-600 mt-1">
          Provide your current and permanent residential address for document verification.
        </p>
      </div>

      {/* 1. Current Address Line 1 & Line 2 */}
      <div className="space-y-4">
        <Input
          id="addressLine1"
          label="Current Address Line 1 (Flat, House No., Building Name)"
          placeholder="e.g. Flat 402, Sunshine Apartments, MG Road"
          required
          autoComplete="address-line1"
          error={errors.addressLine1?.message}
          helpText="Minimum 5 characters."
          {...register('addressLine1')}
        />

        <Input
          id="addressLine2"
          label="Current Address Line 2 (Street, Landmark, Area) - Optional"
          placeholder="e.g. Near City Center Mall"
          autoComplete="address-line2"
          error={errors.addressLine2?.message}
          {...register('addressLine2')}
        />
      </div>

      {/* 2. PIN Code, City, State */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label htmlFor="pinCode" className="block text-sm font-semibold text-slate-700">
              PIN Code <span className="text-brand-red ml-1">*</span>
            </label>
            {pinLookup.isLoading && (
              <span className="inline-flex items-center gap-1 text-xs text-brand-blue">
                <Loader2 className="w-3 h-3 animate-spin" />
                Looking up...
              </span>
            )}
            {pinLookup.city && !pinLookup.isLoading && (
              <span className="inline-flex items-center gap-1 text-xs text-brand-green font-medium">
                <CheckCircle2 className="w-3 h-3" />
                Located
              </span>
            )}
          </div>
          <div className="relative">
            <input
              id="pinCode"
              type="text"
              maxLength={6}
              placeholder="e.g. 110001"
              autoComplete="postal-code"
              required
              aria-invalid={!!errors.pinCode}
              className={`w-full min-h-touch px-3.5 py-2.5 text-sm rounded-lg border bg-white text-slate-900 shadow-sm transition-all focus:outline-none focus:ring-2 ${
                errors.pinCode
                  ? 'border-brand-red focus:border-brand-red focus:ring-red-100'
                  : 'border-slate-300 hover:border-slate-400 focus:border-brand-blue focus:ring-blue-100'
              }`}
              {...register('pinCode')}
            />
          </div>
          {errors.pinCode ? (
            <p className="text-xs text-brand-red font-medium mt-1">{errors.pinCode.message}</p>
          ) : pinLookup.error ? (
            <p className="text-xs text-brand-amber font-medium mt-1">{pinLookup.error}</p>
          ) : (
            <p className="text-xs text-slate-500 mt-1">6-digit Indian PIN code.</p>
          )}
        </div>

        <Input
          id="city"
          label="City / District"
          placeholder="e.g. New Delhi"
          required
          autoComplete="address-level2"
          error={errors.city?.message}
          helpText="Auto-filled via PIN code, editable."
          {...register('city')}
        />

        <div>
          <Input
            id="state"
            label="State / UT"
            placeholder="e.g. Delhi"
            required
            autoComplete="address-level1"
            error={errors.state?.message}
            helpText="Auto-filled via PIN code, editable."
            {...register('state')}
          />
          {stateMismatchWarning && (
            <div className="flex items-center gap-1.5 text-xs text-brand-amber font-medium -mt-2 mb-2">
              <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
              <span>{stateMismatchWarning}</span>
            </div>
          )}
        </div>
      </div>

      {/* 3. Residence Type & Rent & Years */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <Controller
          name="residenceType"
          control={control}
          render={({ field }) => (
            <Select
              id="residenceType"
              name="residenceType"
              label="Residence Ownership Type"
              required
              options={[
                { value: 'Owned', label: 'Self Owned / Owned by Family' },
                { value: 'Rented', label: 'Rented Accommodation' },
                { value: 'Company Provided', label: 'Company Provided Quarters' },
                { value: 'Living with Family', label: 'Living with Parents/Family' },
              ]}
              placeholder="Select residence type"
              value={field.value || ''}
              onChange={field.onChange}
              error={errors.residenceType?.message}
            />
          )}
        />

        {residenceType === 'Rented' ? (
          <Controller
            name="monthlyRent"
            control={control}
            render={({ field }) => (
              <CurrencyInput
                id="monthlyRent"
                name="monthlyRent"
                label="Monthly Rent Amount"
                required
                placeholder="e.g. 15,000"
                value={field.value}
                onChange={field.onChange}
                error={errors.monthlyRent?.message}
                helpText="Factored into debt-to-income affordability."
              />
            )}
          />
        ) : (
          <div className="hidden md:block" />
        )}

        <div>
          <label
            htmlFor="yearsAtCurrentAddress"
            className="block text-sm font-semibold text-slate-700 mb-1.5"
          >
            Years at Current Address <span className="text-brand-red ml-1">*</span>
          </label>
          <input
            id="yearsAtCurrentAddress"
            type="number"
            min={0}
            max={50}
            step={0.5}
            placeholder="e.g. 3"
            required
            aria-invalid={!!errors.yearsAtCurrentAddress}
            className={`w-full min-h-touch px-3.5 py-2.5 text-sm rounded-lg border bg-white text-slate-900 shadow-sm transition-all focus:outline-none focus:ring-2 ${
              errors.yearsAtCurrentAddress
                ? 'border-brand-red focus:border-brand-red focus:ring-red-100'
                : 'border-slate-300 hover:border-slate-400 focus:border-brand-blue focus:ring-blue-100'
            }`}
            {...register('yearsAtCurrentAddress', { valueAsNumber: true })}
          />
          {errors.yearsAtCurrentAddress ? (
            <p className="text-xs text-brand-red font-medium mt-1">
              {errors.yearsAtCurrentAddress.message}
            </p>
          ) : (
            <p className="text-xs text-slate-500 mt-1">
              If less than 1 year, previous address is mandatory.
            </p>
          )}
        </div>
      </div>

      {/* 4. Previous Address Section (Conditional: years < 1) */}
      {Number(yearsAtCurrent) < 1 && yearsAtCurrent !== '' && yearsAtCurrent !== undefined && (
        <div className="p-4 bg-amber-50/60 border border-amber-200 rounded-xl space-y-4 animate-fade-in">
          <div className="flex items-center gap-2 text-amber-800">
            <Building className="w-4 h-4" />
            <h3 className="text-sm font-bold">Previous Address (Required since current residence &lt; 1 yr)</h3>
          </div>

          <Input
            id="prevAddressLine1"
            label="Previous Address Line 1"
            placeholder="Previous building, street, area"
            required
            error={errors.prevAddressLine1?.message}
            {...register('prevAddressLine1')}
          />

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Input
              id="prevPinCode"
              label="Previous PIN Code"
              placeholder="6 digits"
              maxLength={6}
              required
              error={errors.prevPinCode?.message}
              {...register('prevPinCode')}
            />
            <Input
              id="prevCity"
              label="Previous City"
              placeholder="City"
              required
              error={errors.prevCity?.message}
              {...register('prevCity')}
            />
            <Input
              id="prevState"
              label="Previous State"
              placeholder="State"
              required
              error={errors.prevState?.message}
              {...register('prevState')}
            />
          </div>
        </div>
      )}

      {/* 5. Same as Permanent Address Toggle */}
      <div className="pt-2">
        <Controller
          name="sameAsPermanent"
          control={control}
          defaultValue={true}
          render={({ field }) => (
            <Checkbox
              id="sameAsPermanent"
              name="sameAsPermanent"
              checked={field.value ?? true}
              onChange={(e) => field.onChange(e.target.checked)}
            >
              <span className="font-semibold text-slate-800">
                Permanent address is same as current residential address
              </span>
            </Checkbox>
          )}
        />
      </div>

      {/* 6. Permanent Address Fields (Conditional if not same) */}
      {!sameAsPermanent && (
        <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-4 animate-fade-in">
          <div className="flex items-center gap-2 text-slate-800">
            <Home className="w-4 h-4 text-brand-blue" />
            <h3 className="text-sm font-bold">Permanent Address</h3>
          </div>

          <Input
            id="permanentAddressLine1"
            label="Permanent Address Line 1"
            placeholder="Flat, House No., Building Name"
            required
            error={errors.permanentAddressLine1?.message}
            {...register('permanentAddressLine1')}
          />

          <Input
            id="permanentAddressLine2"
            label="Permanent Address Line 2 (Optional)"
            placeholder="Street, Landmark, Area"
            error={errors.permanentAddressLine2?.message}
            {...register('permanentAddressLine2')}
          />

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Input
              id="permanentPinCode"
              label="Permanent PIN Code"
              placeholder="6 digits"
              maxLength={6}
              required
              error={errors.permanentPinCode?.message}
              {...register('permanentPinCode')}
            />
            <Input
              id="permanentCity"
              label="Permanent City"
              placeholder="City"
              required
              error={errors.permanentCity?.message}
              {...register('permanentCity')}
            />
            <Input
              id="permanentState"
              label="Permanent State"
              placeholder="State"
              required
              error={errors.permanentState?.message}
              {...register('permanentState')}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default Step4Address;
