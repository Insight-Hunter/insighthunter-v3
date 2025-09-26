import React, { useState } from 'react';

const InvoiceSetup = () => {
  const [file, setFile] = useState(null);
  const [categories, setCategories] = useState('');
  const [reminders, setReminders] = useState(false);

  const handleFileChange = e => setFile(e.target.files[0]);

  const handleUpload = async () => {
    if (!file) return alert('Please select a file.');

    const formData = new FormData();
    formData.append('file', file);

    const res = await fetch('/api/invoices/upload', {
      method: 'POST',
      body: formData,
    });

    if (res.ok) alert('Invoice uploaded successfully');
    else alert('Upload failed.');
  };

  return (
    <div>
      <h2>Invoice Insights Setup</h2>
      <input type="file" onChange={handleFileChange} />
      <div>
        <label>Invoice Categories (comma separated):</label>
        <input type="text" value={categories} onChange={e => setCategories(e.target.value)} />
      </div>
      <div>
        <label>
          <input type="checkbox" checked={reminders} onChange={e => setReminders(e.target.checked)} />
          Enable Invoice Reminders
        </label>
      </div>
      <button onClick={handleUpload}>Upload Invoice Data</button>
    </div>
  );
};

export default InvoiceSetup;
