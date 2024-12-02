import Link from 'next/link';
import { generateThemeFromHost } from '@/utils/styleUtils';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  host: string;
  createPageURL: (pageNumber: number) => string;
}

export default function Pagination({ 
  currentPage, 
  totalPages, 
  host,
  createPageURL 
}: PaginationProps) {
  const theme = generateThemeFromHost(host);
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);
  
  const buttonBaseStyle = {
    padding: theme.spacing,
    border: `2px solid ${theme.primary}`,
    borderRadius: theme.borderRadius,
    fontFamily: theme.fontFamily,
    transition: 'all 0.3s ease',
  };

  const activeButtonStyle = {
    ...buttonBaseStyle,
    backgroundColor: theme.primary,
    color: '#ffffff',
  };

  const inactiveButtonStyle = {
    ...buttonBaseStyle,
    backgroundColor: 'transparent',
    color: theme.text,
    ':hover': {
      backgroundColor: theme.background,
    },
  };

  const disabledButtonStyle = {
    ...buttonBaseStyle,
    opacity: 0.5,
    cursor: 'not-allowed',
  };
  
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: theme.spacing, margin: `${theme.spacing} 0` }}>
      {currentPage > 1 ? (
        <Link href={createPageURL(currentPage - 1)} style={inactiveButtonStyle}>
          Previous
        </Link>
      ) : (
        <span style={disabledButtonStyle}>Previous</span>
      )}
      
      <div style={{ display: 'flex', gap: theme.spacing }}>
        {pages.map(page => (
          <Link
            key={page}
            href={createPageURL(page)}
            style={currentPage === page ? activeButtonStyle : inactiveButtonStyle}
          >
            {page}
          </Link>
        ))}
      </div>
      
      {currentPage < totalPages ? (
        <Link href={createPageURL(currentPage + 1)} style={inactiveButtonStyle}>
          Next
        </Link>
      ) : (
        <span style={disabledButtonStyle}>Next</span>
      )}
    </div>
  );
}
