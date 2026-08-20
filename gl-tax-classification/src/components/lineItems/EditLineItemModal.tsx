import { useEffect, useState } from 'react';
import { Modal, Form, Input, Select, Button, Alert, Descriptions, Divider, message as antdMessage } from 'antd';
import { RefreshCw } from 'lucide-react';
import {
  TAX_CLASSIFICATION_OPTIONS,
  TAX_CLASSIFICATION_SHORT_LABEL,
  getConfidenceBand,
} from '@/constants/classifications';
import { LINE_ITEM_STATUS_OPTIONS } from '@/constants/statuses';
import { labels } from '@/constants/labels';
import { messages } from '@/constants/messages';
import { formatCurrency, formatPercent } from '@/utils/formatting';
import {
  updateLineItem,
  rerunLineItem,
} from '@/services/repositories/classificationRepository';
import type { LineItem, TaxClassificationCode, LineItemStatus } from '@/types/lineItem';

interface EditLineItemModalProps {
  open: boolean;
  item: LineItem | null;
  onClose: () => void;
  onSaved: (updated: LineItem) => void;
}

const CONFIDENCE_TONE_CLASS: Record<'HIGH' | 'MEDIUM' | 'LOW', string> = {
  HIGH: 'text-success-text',
  MEDIUM: 'text-warning-text',
  LOW: 'text-error-text',
};

export function EditLineItemModal({ open, item, onClose, onSaved }: EditLineItemModalProps) {
  const [text, setText] = useState('');
  const [vendorName, setVendorName] = useState('');
  const [taxClassification, setTaxClassification] = useState<TaxClassificationCode>('RE');
  const [status, setStatus] = useState<LineItemStatus>('IN_REVIEW');

  const [aiSuggested, setAiSuggested] = useState<TaxClassificationCode>('RE');
  const [confidence, setConfidence] = useState(0);
  const [reasoning, setReasoning] = useState('');

  const [saving, setSaving] = useState(false);
  const [rerunning, setRerunning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (item) {
      setText(item.text);
      setVendorName(item.vendorName);
      setTaxClassification(item.taxClassification);
      setStatus(item.status);
      setAiSuggested(item.aiSuggestedClassification);
      setConfidence(item.confidence);
      setReasoning(item.llmReasoning);
      setError(null);
    }
  }, [item]);

  if (!item) return null;

  const handleRerun = async () => {
    setRerunning(true);
    setError(null);
    try {
      const result = await rerunLineItem(item.id);
      setAiSuggested(result.aiSuggestedClassification);
      setConfidence(result.confidence);
      setReasoning(result.llmReasoning);
      antdMessage.success(messages.success.rerunComplete);
    } catch (err) {
      setError((err as { message?: string })?.message ?? messages.errors.rerunFailed);
    } finally {
      setRerunning(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      const updated = await updateLineItem(item.id, {
        text,
        vendorName,
        taxClassification,
        status,
      });
      antdMessage.success(messages.success.changesSaved);
      onSaved(updated);
      onClose();
    } catch (err) {
      setError((err as { message?: string })?.message ?? messages.errors.saveChanges);
    } finally {
      setSaving(false);
    }
  };

  const band = getConfidenceBand(confidence);

  return (
    <Modal
      title="Edit Line Item"
      open={open}
      onCancel={onClose}
      footer={null}
      width={640}
      destroyOnHidden
    >
      {error && <Alert type="error" message={error} showIcon className="mb-4" />}

      <Descriptions column={{ xs: 1, sm: 2 }} size="small" className="mb-2">
        <Descriptions.Item label="Delivery Number">{item.deliveryNumber}</Descriptions.Item>
        <Descriptions.Item label="Profit Center">{item.profitCenter}</Descriptions.Item>
        <Descriptions.Item label="Amount">{formatCurrency(item.amount, item.currency)}</Descriptions.Item>
      </Descriptions>

      <Form layout="vertical" className="mt-3">
        <Form.Item label="Text">
          <Input.TextArea value={text} onChange={(e) => setText(e.target.value)} autoSize={{ minRows: 2, maxRows: 4 }} />
        </Form.Item>

        <Form.Item label="Vendor Name">
          <Input value={vendorName} onChange={(e) => setVendorName(e.target.value)} />
        </Form.Item>

        <div className="bg-surface-muted border border-border rounded-lg p-3 mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-text-muted uppercase tracking-wide">AI Suggestion</span>
            <Button
              size="small"
              icon={<RefreshCw size={13} className={rerunning ? 'animate-spin' : ''} />}
              onClick={handleRerun}
              loading={rerunning}
            >
              {rerunning ? 'Re-running classification...' : labels.actions.rerunClassification}
            </Button>
          </div>
          <div className="grid grid-cols-2 gap-3 mb-2">
            <div>
              <div className="text-xs text-text-muted mb-0.5">AI Suggested Classification</div>
              <div className="text-sm font-medium text-text">{TAX_CLASSIFICATION_SHORT_LABEL[aiSuggested]}</div>
            </div>
            <div>
              <div className="text-xs text-text-muted mb-0.5">Confidence</div>
              <div className={`text-sm font-medium ${CONFIDENCE_TONE_CLASS[band]}`}>{formatPercent(confidence)}</div>
            </div>
          </div>
          <div>
            <div className="text-xs text-text-muted mb-0.5">LLM Reasoning</div>
            <div className="text-sm text-text leading-snug">{reasoning}</div>
          </div>
        </div>

        <Divider className="!my-3" />

        <Form.Item label="Final Tax Classification">
          <Select
            value={taxClassification}
            onChange={setTaxClassification}
            options={TAX_CLASSIFICATION_OPTIONS}
          />
        </Form.Item>

        <Form.Item label="Review Status" className="!mb-0">
          <Select value={status} onChange={setStatus} options={LINE_ITEM_STATUS_OPTIONS} />
        </Form.Item>
      </Form>

      <div className="flex justify-end gap-2 mt-6">
        <Button onClick={onClose} disabled={saving}>
          {labels.actions.cancel}
        </Button>
        <Button type="primary" onClick={handleSave} loading={saving}>
          {labels.actions.save}
        </Button>
      </div>
    </Modal>
  );
}
