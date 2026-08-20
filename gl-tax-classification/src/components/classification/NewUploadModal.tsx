import { useState } from 'react';
import { Modal, Upload, Button, Alert, Typography } from 'antd';
import type { UploadProps } from 'antd';
import { FileSpreadsheet, UploadCloud, CheckCircle2, X } from 'lucide-react';
import { validateUploadFile } from '@/utils/validation';
import { createClassificationRun } from '@/services/repositories/classificationRepository';
import { labels } from '@/constants/labels';
import { messages } from '@/constants/messages';
import type { ClassificationRun } from '@/types/run';

const { Dragger } = Upload;

interface NewUploadModalProps {
  open: boolean;
  onClose: () => void;
  onCreated: (run: ClassificationRun) => void;
}

interface FileSlotState {
  file: File | null;
  error: string | null;
}

function FileSlot({
  label,
  hint,
  state,
  onSelect,
  onRemove,
}: {
  label: string;
  hint: string;
  state: FileSlotState;
  onSelect: (file: File) => void;
  onRemove: () => void;
}) {
  const draggerProps: UploadProps = {
    multiple: false,
    showUploadList: false,
    accept: '.xlsx,.xls,.csv',
    beforeUpload: (file) => {
      onSelect(file);
      return false; // prevent auto-upload; we handle it ourselves
    },
  };

  return (
    <div className="mb-4">
      <Typography.Text className="text-sm font-medium text-text block mb-1.5">{label}</Typography.Text>

      {!state.file ? (
        <Dragger {...draggerProps} className="!bg-surface-muted">
          <div className="py-2">
            <UploadCloud size={22} className="mx-auto text-text-subtle mb-1.5" />
            <p className="text-sm text-text m-0">{labels.upload.dragHint}</p>
            <p className="text-xs text-text-muted mt-1 mb-0">{hint}</p>
          </div>
        </Dragger>
      ) : (
        <div
          className={`flex items-center justify-between gap-3 border rounded-lg px-3 py-2.5 ${
            state.error ? 'border-error-text bg-error-bg' : 'border-success-text bg-success-bg'
          }`}
        >
          <div className="flex items-center gap-2 min-w-0">
            <FileSpreadsheet size={18} className={state.error ? 'text-error-text' : 'text-success-text'} />
            <div className="min-w-0">
              <div className="text-sm text-text truncate max-w-[220px]">{state.file.name}</div>
              {state.error ? (
                <div className="text-xs text-error-text mt-0.5">{state.error}</div>
              ) : (
                <div className="text-xs text-success-text mt-0.5 flex items-center gap-1">
                  <CheckCircle2 size={12} /> Ready
                </div>
              )}
            </div>
          </div>
          <button
            type="button"
            onClick={onRemove}
            className="shrink-0 text-text-muted hover:text-text cursor-pointer bg-transparent border-none"
            aria-label="Remove file"
          >
            <X size={16} />
          </button>
        </div>
      )}
    </div>
  );
}

export function NewUploadModal({ open, onClose, onCreated }: NewUploadModalProps) {
  const [glSlot, setGlSlot] = useState<FileSlotState>({ file: null, error: null });
  const [provisionSlot, setProvisionSlot] = useState<FileSlotState>({ file: null, error: null });
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const reset = () => {
    setGlSlot({ file: null, error: null });
    setProvisionSlot({ file: null, error: null });
    setSubmitError(null);
    setSubmitting(false);
  };

  const handleClose = () => {
    if (submitting) return;
    reset();
    onClose();
  };

  const handleSelect = (setter: typeof setGlSlot) => (file: File) => {
    const result = validateUploadFile(file);
    setter({ file, error: result.valid ? null : (result.error ?? null) });
  };

  const canSubmit =
    glSlot.file && !glSlot.error && provisionSlot.file && !provisionSlot.error && !submitting;

  const handleSubmit = async () => {
    if (!glSlot.file || !provisionSlot.file) return;
    setSubmitting(true);
    setSubmitError(null);
    try {
      const run = await createClassificationRun({
        glFile: glSlot.file,
        provisionFile: provisionSlot.file,
      });
      onCreated(run);
      reset();
      onClose();
    } catch (err) {
      setSubmitError((err as { message?: string })?.message ?? messages.errors.uploadFailed);
      setSubmitting(false);
    }
  };

  return (
    <Modal
      title="New Upload"
      open={open}
      onCancel={handleClose}
      footer={null}
      mask={{ closable: !submitting }}
      closable={!submitting}
      destroyOnHidden
    >
      <p className="text-sm text-text-muted mb-4">
        Upload the SAP GL export and Provision file to start a new classification run.
      </p>

      {submitError && <Alert type="error" message={submitError} showIcon className="mb-4" />}

      <FileSlot
        label={labels.upload.glFileLabel}
        hint={labels.upload.acceptedTypes}
        state={glSlot}
        onSelect={handleSelect(setGlSlot)}
        onRemove={() => setGlSlot({ file: null, error: null })}
      />
      <FileSlot
        label={labels.upload.provisionFileLabel}
        hint={labels.upload.acceptedTypes}
        state={provisionSlot}
        onSelect={handleSelect(setProvisionSlot)}
        onRemove={() => setProvisionSlot({ file: null, error: null })}
      />

      <div className="flex justify-end gap-2 mt-6">
        <Button onClick={handleClose} disabled={submitting}>
          {labels.actions.cancel}
        </Button>
        <Button type="primary" onClick={handleSubmit} disabled={!canSubmit} loading={submitting}>
          Start Classification
        </Button>
      </div>
    </Modal>
  );
}
