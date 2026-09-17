import React from 'react';
import { Eye, ShieldAlert, ShieldCheck, ChevronLeft, ChevronRight, Users } from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import type { AdminUser } from '../../../types/admin.types';

interface UsersTableProps {
  users: AdminUser[];
  totalElements: number;
  totalPages: number;
  currentPage: number;
  pageSize?: number;
  onPageChange: (page: number) => void;
  onViewDetails: (user: AdminUser) => void;
  onOpenConfirmAction: (user: AdminUser, action: 'SUSPEND' | 'REINSTATE') => void;
}

export const UsersTable: React.FC<UsersTableProps> = ({
  users,
  totalElements,
  totalPages,
  currentPage,
  onPageChange,
  onViewDetails,
  onOpenConfirmAction,
}) => {
  if (users.length === 0) {
    return (
      <div
        className="card"
        style={{
          textAlign: 'center',
          padding: '48px 24px',
          color: 'var(--color-text-muted)',
        }}
      >
        <Users size={36} color="var(--color-text-light)" style={{ marginBottom: 12 }} />
        <h4 style={{ fontSize: 16, fontWeight: 700, margin: 0, color: 'var(--color-text-main)' }}>
          No user accounts found
        </h4>
        <p style={{ fontSize: 13, color: 'var(--color-text-light)', margin: '4px 0 0 0' }}>
          Try clearing your search terms or adjusting the role and status filters.
        </p>
      </div>
    );
  }

  return (
    <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
      {/* Table */}
      <div className="data-table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th style={{ width: '28%' }}>User Account</th>
              <th style={{ width: '16%' }}>Contact Phone</th>
              <th style={{ width: '14%' }}>Role</th>
              <th style={{ width: '12%' }}>Status</th>
              <th style={{ width: '12%' }}>Complaints</th>
              <th style={{ width: '18%', textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => {
              const isProtectedAdmin = user.role === 'ADMIN';
              const isSuspended = user.accountStatus === 'SUSPENDED';
              const complaintCount = user.validComplaintCount || 0;

              return (
                <tr key={user.userId || user.id || user.email}>
                  {/* User Profile Info */}
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div
                        style={{
                          width: 34,
                          height: 34,
                          borderRadius: 'var(--radius-full)',
                          backgroundColor: isProtectedAdmin
                            ? '#E0F2FE'
                            : user.role === 'SHOP_OWNER'
                            ? 'var(--color-info-bg)'
                            : 'var(--color-primary-bg)',
                          color: isProtectedAdmin
                            ? '#0369A1'
                            : user.role === 'SHOP_OWNER'
                            ? 'var(--color-info)'
                            : 'var(--color-primary)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 700,
                          fontSize: 13,
                          flexShrink: 0,
                        }}
                      >
                        {user.fullName.charAt(0).toUpperCase()}
                      </div>
                      <div style={{ minWidth: 0 }}>
                        <div
                          style={{
                            fontWeight: 700,
                            fontSize: 13.5,
                            color: 'var(--color-text-main)',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                          }}
                        >
                          {user.fullName}
                        </div>
                        <div
                          style={{
                            fontSize: 11.5,
                            color: 'var(--color-text-light)',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                          }}
                        >
                          {user.email}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Phone */}
                  <td>
                    <span
                      style={{
                        fontSize: 12.5,
                        color: 'var(--color-text-muted)',
                        fontFamily: 'var(--mono)',
                      }}
                    >
                      {user.phone || '—'}
                    </span>
                  </td>

                  {/* Role */}
                  <td>
                    {isProtectedAdmin ? (
                      <Badge variant="info">Protected Admin</Badge>
                    ) : user.role === 'SHOP_OWNER' ? (
                      <Badge variant="info">Shop Owner</Badge>
                    ) : (
                      <Badge variant="neutral">Customer</Badge>
                    )}
                  </td>

                  {/* Account Status */}
                  <td>
                    {isSuspended ? (
                      <Badge variant="error">Suspended</Badge>
                    ) : (
                      <Badge variant="success">Active</Badge>
                    )}
                  </td>

                  {/* Complaints History */}
                  <td>
                    {complaintCount > 0 ? (
                      <span
                        style={{
                          fontSize: 11.5,
                          fontWeight: 700,
                          color: 'var(--color-error)',
                          backgroundColor: 'var(--color-error-bg)',
                          padding: '2px 8px',
                          borderRadius: 'var(--radius-full)',
                        }}
                      >
                        {complaintCount} valid
                      </span>
                    ) : (
                      <span style={{ fontSize: 12, color: 'var(--color-text-light)' }}>
                        0 disputes
                      </span>
                    )}
                  </td>

                  {/* Actions */}
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 6 }}>
                      <Button
                        variant="secondary"
                        size="sm"
                        icon={<Eye size={14} />}
                        onClick={() => onViewDetails(user)}
                        title="View Full Profile Details"
                      >
                        Details
                      </Button>

                      {!isProtectedAdmin && (
                        <>
                          {isSuspended ? (
                            <Button
                              variant="primary"
                              size="sm"
                              icon={<ShieldCheck size={14} />}
                              onClick={() => onOpenConfirmAction(user, 'REINSTATE')}
                              title="Reinstate Account"
                            >
                              Reinstate
                            </Button>
                          ) : (
                            <Button
                              variant="danger"
                              size="sm"
                              icon={<ShieldAlert size={14} />}
                              onClick={() => onOpenConfirmAction(user, 'SUSPEND')}
                              title="Suspend Account"
                            >
                              Suspend
                            </Button>
                          )}
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '14px 20px',
            borderTop: '1px solid var(--color-border)',
            backgroundColor: 'var(--color-surface-subtle)',
            flexWrap: 'wrap',
            gap: 10,
          }}
        >
          <div style={{ fontSize: 12.5, color: 'var(--color-text-muted)' }}>
            Showing page <strong>{currentPage + 1}</strong> of <strong>{totalPages}</strong> (
            {totalElements} total users)
          </div>

          <div style={{ display: 'flex', gap: 8 }}>
            <Button
              variant="secondary"
              size="sm"
              icon={<ChevronLeft size={15} />}
              disabled={currentPage === 0}
              onClick={() => onPageChange(currentPage - 1)}
            >
              Previous
            </Button>
            <Button
              variant="secondary"
              size="sm"
              icon={<ChevronRight size={15} />}
              disabled={currentPage >= totalPages - 1}
              onClick={() => onPageChange(currentPage + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
