import { useFormContext, Controller } from 'react-hook-form';
import { PenTool, Sparkles } from 'lucide-react';
import FileUpload from '../common/FileUpload';
import SignatureCanvas from '../common/SignatureCanvas';
import { getRequiredDocuments } from '../../schemas/step7Schema';

const Step7Documents = () => {
  const {
    control,
    watch,
    formState: { errors },
  } = useFormContext();

  const loanType = watch('loanType') || 'personal';
  const employmentType = watch('employmentType') || 'salaried';
  const panVerified = !!watch('panVerified');
  const documents = watch('documents') || {};

  const requiredDocList = getRequiredDocuments(loanType, employmentType, panVerified);

  // Calculate uploaded count
  const uploadedCount = requiredDocList.filter((d) => {
    const files = documents[d.id];
    return files && Array.isArray(files) && files.length > 0;
  }).length;

  const totalMandatoryCount = requiredDocList.filter((d) => d.required).length;

  return (
    <div className="space-y-6">
      <div className="border-b border-slate-200 pb-4">
        <h2 className="text-xl font-bold text-slate-900">Document Upload & E-Signature</h2>
        <p className="text-sm text-slate-600 mt-1">
          Upload required financial and identity documents with automatic client-side compression.
        </p>
      </div>

      {/* Progress & Document Checklist Summary */}
      <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-lg bg-blue-50 text-brand-blue flex items-center justify-center font-bold text-sm">
            {uploadedCount}/{totalMandatoryCount}
          </div>
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Mandatory Checklist
            </span>
            <p className="text-sm font-bold text-slate-800">
              {uploadedCount >= totalMandatoryCount
                ? 'All mandatory documents uploaded!'
                : `${totalMandatoryCount - uploadedCount} document(s) remaining`}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-brand-green bg-green-50 px-3 py-1.5 rounded-lg border border-green-200">
          <Sparkles className="w-4 h-4 text-brand-green" />
          <span>Automatic Canvas compression active (Up to 80% size savings)</span>
        </div>
      </div>

      {/* Upload Zones */}
      <div className="space-y-5">
        {requiredDocList.map((doc) => {
          const docErrors = errors.documents?.[doc.id];
          const isUploaded = documents[doc.id] && documents[doc.id].length > 0;

          return (
            <div
              key={doc.id}
              className={`p-4 rounded-xl border transition-all ${
                isUploaded
                  ? 'border-green-200 bg-green-50/20'
                  : docErrors
                  ? 'border-red-200 bg-red-50/20'
                  : 'border-slate-200 bg-white'
              }`}
            >
              <Controller
                name={`documents.${doc.id}`}
                control={control}
                defaultValue={[]}
                render={({ field }) => (
                  <FileUpload
                    id={`doc-${doc.id}`}
                    label={doc.name}
                    required={doc.required}
                    accept={doc.accept}
                    maxSize={doc.maxSize}
                    maxFiles={doc.maxFiles}
                    value={field.value || []}
                    onChange={field.onChange}
                    error={docErrors?.message}
                    helpText={doc.optionalNote || doc.description}
                  />
                )}
              />
            </div>
          );
        })}
      </div>

      {/* E-Signature Section */}
      <div className="p-5 bg-white border border-slate-200 rounded-xl space-y-4 shadow-xs">
        <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
          <PenTool className="w-5 h-5 text-brand-blue" />
          <h3 className="text-base font-bold text-slate-900">
            Primary Applicant Digital Signature <span className="text-brand-red">*</span>
          </h3>
        </div>

        <p className="text-xs text-slate-600">
          Under Section 3A of the Information Technology Act, 2000, your electronic signature will be legally affixed to your loan agreement and Key Fact Statement.
        </p>

        <Controller
          name="signature"
          control={control}
          render={({ field }) => (
            <SignatureCanvas
              id="primarySignature"
              label="Primary Applicant Digital Signature"
              required
              value={field.value}
              onChange={field.onChange}
              error={errors.signature?.message}
            />
          )}
        />
      </div>
    </div>
  );
};

export default Step7Documents;
