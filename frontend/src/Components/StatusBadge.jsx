export default function StatusBadge({ status, className = '' }) {
  const getStatusConfig = (value) => {
    const statusMap = {
      // Application statuses
      pending: { label: 'Pending', className: 'bg-warning text-white' },
      approved: { label: 'Approved', className: 'bg-success text-white' },
      rejected: { label: 'Rejected', className: 'bg-destructive text-white' },
      reviewing: { label: 'Reviewing', className: 'bg-info text-white' },
      
      // Property statuses
      verified: { label: 'Verified', className: 'bg-success text-white' },
      unverified: { label: 'Unverified', className: 'bg-muted text-muted-foreground' },
      verification_pending: { label: 'Verification Pending', className: 'bg-warning text-white' },
      
      // Contract statuses
      active: { label: 'Active', className: 'bg-success text-white' },
      pending_signatures: { label: 'Pending Signatures', className: 'bg-warning text-white' },
      pending_photos: { label: 'Pending Photos', className: 'bg-warning text-white' },
      pending_tenant_approval: { label: 'Pending Tenant Approval', className: 'bg-warning text-white' },
      
      // Escrow statuses
      secured: { label: 'Secured', className: 'bg-success text-white' },
      released: { label: 'Released', className: 'bg-info text-white' },
      release_requested: { label: 'Release Requested', className: 'bg-warning text-white' },
      disputed: { label: 'Disputed', className: 'bg-destructive text-white' },
    };
    return statusMap[value] || { label: value, className: 'bg-muted text-muted-foreground' };
  };

  const config = getStatusConfig(status);

  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${config.className} ${className}`}>
      {config.label}
    </span>
  );
}

