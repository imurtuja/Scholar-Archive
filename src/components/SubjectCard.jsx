import React from 'react';
import { MoreVertical, FileText, Clock } from 'lucide-react';

const SubjectCard = ({ title, code, progress, nextClass, color }) => {
    return (
        <div className="card" style={{ position: 'relative' }}>
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                marginBottom: '1rem'
            }}>
                <div style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: color,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontWeight: 'bold',
                    fontSize: '1.25rem'
                }}>
                    {title.charAt(0)}
                </div>
                <button style={{ color: 'var(--color-text-muted)' }}>
                    <MoreVertical size={20} />
                </button>
            </div>

            <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '0.25rem' }}>{title}</h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', marginBottom: '1.5rem' }}>{code}</p>

            <div style={{ marginBottom: '1.5rem' }}>
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    fontSize: '0.875rem',
                    marginBottom: '0.5rem',
                    fontWeight: '500'
                }}>
                    <span>Progress</span>
                    <span>{progress}%</span>
                </div>
                <div style={{
                    width: '100%',
                    height: '8px',
                    backgroundColor: '#F1F5F9',
                    borderRadius: 'var(--radius-full)',
                    overflow: 'hidden'
                }}>
                    <div style={{
                        width: `${progress}%`,
                        height: '100%',
                        backgroundColor: color,
                        borderRadius: 'var(--radius-full)'
                    }} />
                </div>
            </div>

            <div style={{
                display: 'flex',
                gap: '1rem',
                paddingTop: '1rem',
                borderTop: '1px solid var(--color-border)',
                fontSize: '0.875rem',
                color: 'var(--color-text-muted)'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                    <Clock size={16} />
                    <span>{nextClass}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                    <FileText size={16} />
                    <span>12 Files</span>
                </div>
            </div>
        </div>
    );
};

export default SubjectCard;
