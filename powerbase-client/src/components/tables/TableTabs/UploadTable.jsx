import React, { useRef, useEffect } from 'react';
import { DocumentAddIcon, PaperClipIcon } from '@heroicons/react/solid';
import cn from 'classnames';
import PropTypes from 'prop-types';

export default function CsvReader({ csvFile, setCsvFile, setCsvArray }) {
  const processCSV = (str, delim = ',') => {
    const headers = str.slice(0, str.indexOf('\n')).split(delim);
    const rows = str.slice(str.indexOf('\n') + 1).split('\n');

    const newArray = rows.map((row) => {
      const values = row.split(delim);
      const eachObject = headers.reduce((obj, header, i) => {
        obj[header] = values[i];
        return obj;
      }, {});
      return eachObject;
    });

    setCsvArray(newArray);
  };

  const stageCsvData = () => {
    const file = csvFile;
    const reader = new FileReader();

    reader.onload = function processGivenCSV(e) {
      const text = e.target.result;
      processCSV(text);
    };

    reader.readAsText(file);
  };

  const hiddenFileInput = useRef(null);

  useEffect(() => {
    if (csvFile) stageCsvData();
  }, [csvFile]);

  const handleClick = () => {
    hiddenFileInput.current.click();
  };

  return (
    <form id="csv-form" className="flex flex-col align-center h-full">
      <div className="flex flex-col align-center h-full p-2">
        {!csvFile && (
          <button onClick={handleClick} type="button">
            <DocumentAddIcon
              className="w-12 h-12 text-gray-600 hover:text-indigo-600 align-center self-center font-light cursor-pointer"
            />
          </button>
        )}
        {csvFile && (
          <PaperClipIcon className="w-12 h-12 text-indigo-600 align-center self-center font-light cursor-pointer" />
        )}
        <div
          className={cn(
            'text-gray-600 text-sm self-center mt-1',
            csvFile && 'italic',
          )}
        >
          {!csvFile ? 'Select a CSV File to Import' : csvFile?.name}
        </div>
      </div>
      <input
        type="file"
        ref={hiddenFileInput}
        accept=".csv"
        className="hidden"
        id="csvFile"
        onChange={(e) => {
          setCsvFile(e.target.files[0]);
        }}
      />
    </form>
  );
}

CsvReader.propTypes = {
  csvFile: PropTypes.any,
  setCsvFile: PropTypes.func.isRequired,
  setCsvArray: PropTypes.func.isRequired,
};
