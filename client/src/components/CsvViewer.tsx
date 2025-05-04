import React, { useMemo } from 'react';

interface CsvViewerProps {
  content: string;
  showLineNumbers?: boolean;
}

const CsvViewer: React.FC<CsvViewerProps> = ({ content, showLineNumbers = true }) => {
  const parsedData = useMemo(() => {
    // Split content into lines
    const lines = content.split('\n');
    
    // Parse each line into cells
    return lines.map(line => {
      // Handle quoted values with commas inside them
      const cells: string[] = [];
      let currentCell = '';
      let insideQuotes = false;
      
      for (let i = 0; i < line.length; i++) {
        const char = line[i];
        
        if (char === '"' && (i === 0 || line[i-1] !== '\\')) {
          insideQuotes = !insideQuotes;
          currentCell += char;
        } else if (char === ',' && !insideQuotes) {
          cells.push(currentCell);
          currentCell = '';
        } else {
          currentCell += char;
        }
      }
      
      // Add the last cell
      cells.push(currentCell);
      
      return cells;
    });
  }, [content]);
  
  // Skip empty lines at the end
  const filteredData = useMemo(() => {
    return parsedData.filter(row => row.length > 0 && row.some(cell => cell.trim() !== ''));
  }, [parsedData]);
  
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-700">
        <thead className="bg-gray-800">
          <tr>
            {showLineNumbers && (
              <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-400 uppercase tracking-wider w-12 border-r border-gray-700">
                #
              </th>
            )}
            {filteredData[0]?.map((header, index) => (
              <th 
                key={index} 
                scope="col" 
                className="px-3 py-2 text-left text-xs font-medium text-gray-400 uppercase tracking-wider"
              >
                {header.replace(/^"|"$/g, '')}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-gray-900 divide-y divide-gray-800">
          {filteredData.slice(1).map((row, rowIndex) => (
            <tr key={rowIndex} className={rowIndex % 2 === 0 ? 'bg-gray-900' : 'bg-gray-800/50'}>
              {showLineNumbers && (
                <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500 border-r border-gray-700">
                  {rowIndex + 2}
                </td>
              )}
              {row.map((cell, cellIndex) => (
                <td 
                  key={cellIndex} 
                  className="px-3 py-2 whitespace-nowrap text-sm text-gray-300"
                >
                  {cell.replace(/^"|"$/g, '')}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default CsvViewer;