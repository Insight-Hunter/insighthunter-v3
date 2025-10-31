import React, { useEffect, useState } from "react";
export function PersonalInfoForm({ defaultValues, onChange }) {
    const [name, setName] = useState((defaultValues === null || defaultValues === void 0 ? void 0 : defaultValues.name) || "");
    const [email, setEmail] = useState((defaultValues === null || defaultValues === void 0 ? void 0 : defaultValues.email) || "");
    const [contact, setContact] = useState((defaultValues === null || defaultValues === void 0 ? void 0 : defaultValues.contact) || "");
    useEffect(() => {
        onChange({ name, email, contact });
    }, [name, email, contact, onChange]);
    return (<div>
      <h2>Personal Information</h2>
      <label>
        Name
        <input type="text" value={name} onChange={e => setName(e.target.value)} required/>
      </label>
      <label>
        Email
        <input type="email" value={email} onChange={e => setEmail(e.target.value)} required/>
      </label>
      <label>
        Contact Number
        <input type="tel" value={contact} onChange={e => setContact(e.target.value)}/>
      </label>
    </div>);
}
export function PersonalInfoForm({ defaultValues, onChange }) {
    const [name, setName] = useState((defaultValues === null || defaultValues === void 0 ? void 0 : defaultValues.name) || "");
    const [email, setEmail] = useState((defaultValues === null || defaultValues === void 0 ? void 0 : defaultValues.email) || "");
    const [contact, setContact] = useState((defaultValues === null || defaultValues === void 0 ? void 0 : defaultValues.contact) || "");
    useEffect(() => {
        onChange({ name, email, contact });
    }, [name, email, contact, onChange]);
    return (<div>
      <h2>Personal Information</h2>
      <label>
        Name
        <input type="text" value={name} onChange={e => setName(e.target.value)} required/>
      </label>
      <label>
        Email
        <input type="email" value={email} onChange={e => setEmail(e.target.value)} required/>
      </label>
      <label>
        Contact Number
        <input type="tel" value={contact} onChange={e => setContact(e.target.value)}/>
      </label>
    </div>);
}
