import { cn } from '@/lib/utils';

type Status =
  | 'pending'
  | 'approved'
  | 'rejected'
  | 'secured'
  | 'released'
  | 'release_requested'
  | 'disputed'
  | 'active'
  | 'completed'
  | 'fully_signed'
  | 'pending_photos'
  | 'pending_signatures'
  | 'pending_tenant_approval'
  | 'verified'
  | 'unverified'
  | 'verification_pending';

interface StatusBadgeProps {
  status: Status;
  className?: string;
}

const statusConfig: Record<Status, { label: string; className: string }> = {
  pending: {
    label: 'Pending',
    className: 'bg-warning/10 text-warning border-warning/20',
  },
  approved: {
    label: 'Approved',
    className: 'bg-success/10 text-success border-success/20',
  },
  rejected: {
    label: 'Rejected',
    className: 'bg-destructive/10 text-destructive border-destructive/20',
  },
  secured: {
    label: 'Secured',
    className: 'bg-success/10 text-success border-success/20',
  },
  released: {
    label: 'Released',
    className: 'bg-info/10 text-info border-info/20',
  },
  release_requested: {
    label: 'Release Requested',
    className: 'bg-warning/10 text-warning border-warning/20',
  },
  disputed: {
    label: 'Disputed',
    className: 'bg-destructive/10 text-destructive border-destructive/20',
  },
  active: {
    label: 'Active',
    className: 'bg-success/10 text-success border-success/20',
  },
  completed: {
    label: 'Completed',
    className: 'bg-muted text-muted-foreground border-border',
  },
  fully_signed: {
    label: 'Fully Signed',
    className: 'bg-success/10 text-success border-success/20',
  },
  pending_photos: {
    label: 'Awaiting Photos',
    className: 'bg-warning/10 text-warning border-warning/20',
  },
  pending_signatures: {
    label: 'Awaiting Signatures',
    className: 'bg-warning/10 text-warning border-warning/20',
  },
  pending_tenant_approval: {
    label: 'Pending Tenant Approval',
    className: 'bg-warning/10 text-warning border-warning/20',
  },
  verified: {
    label: 'Verified',
    className: 'bg-success/10 text-success border-success/20',
  },
  unverified: {
    label: 'Unverified',
    className: 'bg-warning/10 text-warning border-warning/20',
  },
  verification_pending: {
    label: 'Verification Pending',
    className: 'bg-info/10 text-info border-info/20',
  },
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status];
  
  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border',
        config.className,
        className
      )}
    >
      {config.label}
    </span>
  );
}
