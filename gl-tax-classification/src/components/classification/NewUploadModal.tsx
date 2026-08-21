import { useState } from 'react';
import { Modal, Upload, Button, Alert, Input, Typography } from 'antd';
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
    <div className="min-w-0">
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
  const [runId, setRunId] = useState('');
  const [runIdTouched, setRunIdTouched] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const reset = () => {
    setGlSlot({ file: null, error: null });
    setProvisionSlot({ file: null, error: null });
    setRunId('');
    setRunIdTouched(false);
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
    runId.trim().length > 0 &&
    glSlot.file && !glSlot.error && provisionSlot.file && !provisionSlot.error && !submitting;
  const runIdError = runIdTouched && runId.trim().length === 0 ? 'Run ID is required.' : null;

  const handleSubmit = async () => {
    setRunIdTouched(true);
    if (!runId.trim()) return;
    if (!glSlot.file || !provisionSlot.file) return;
    setSubmitting(true);
    setSubmitError(null);
    try {
      const run = await createClassificationRun({
        runId: runId.trim(),
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
      width="min(92vw, 940px)"
      mask={{ closable: !submitting }}
      closable={!submitting}
      destroyOnHidden
    >
      <p className="text-sm text-text-muted mb-4">
        Upload the SAP GL export and Provision file to start a new classification run.
      </p>

      <div className="mb-5">
        <label htmlFor="new-run-id" className="text-sm font-medium text-text block mb-1.5">
          <span className="text-error-text mr-1">*</span>Run ID
        </label>
        <Input
          id="new-run-id"
          value={runId}
          placeholder="Enter Run ID"
          status={runIdError ? 'error' : undefined}
          className="h-10"
          onChange={(event) => {
            setRunId(event.target.value);
            if (!runIdTouched) setRunIdTouched(true);
          }}
          onBlur={() => setRunIdTouched(true)}
        />
        {runIdError && <div className="text-xs text-error-text mt-1.5">{runIdError}</div>}
      </div>

      {submitError && <Alert type="error" message={submitError} showIcon className="mb-4" />}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
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
      </div>

      <div className="w-full mt-6 pt-5 pb-1 border-t border-border flex justify-end items-center gap-3">
        <Button className="h-10 min-w-[88px]" onClick={handleClose} disabled={submitting}>
          {labels.actions.cancel}
        </Button>
        <Button type="primary" className="h-10 min-w-[176px]" onClick={handleSubmit} disabled={!canSubmit} loading={submitting}>
          Start Classification
        </Button>
      </div>
    </Modal>
  );
}
