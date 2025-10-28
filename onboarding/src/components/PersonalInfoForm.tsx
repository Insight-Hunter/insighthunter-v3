import React, { useEffect, useState } from "react";

export interface PersonalInfo {
  name: string;
  email: string;
  contact?: string;
}

interface PersonalInfoFormProps {
  defaultValues?: PersonalInfo;
  onChange: ( PersonalInfo) => void;
}

export function PersonalInfoForm({ defaultValues, onChange }: PersonalInfoFormProps) {
  const [name, setName] = useState(defaultValues?.name || "");
  const [email, setEmail] = useState(defaultValues?.email || "");
  const [contact, setContact] = useState(defaultValues?.contact || "");

  useEffect(() => {
    onChange({ name, email, contact });
  }, [name, email, contact, onChange]);

  return (
    <div>
      <h2>Personal Information</h2>
      <label>
        Name
        <input type="text" value={name} onChange={e => setName(e.target.value)} required />
      </label>
      <label>
        Email
        <input type="email" value={email} onChange={e => setEmail(e.target.value)} required />
      </label>
      <label>
        Contact Number
        <input type="tel" value={contact} onChange={e => setContact(e.target.value)} />
      </label>
    </div>
  );
}
import React, { useEffect, useState } from "react";

export interface PersonalInfo {
  name: string;
  email: string;
  contact?: string;
}

interface PersonalInfoFormProps {
  defaultValues?: PersonalInfo;
  onChange: ( PersonalInfo) => void;
}

export function PersonalInfoForm({ defaultValues, onChange }: PersonalInfoFormProps) {
  const [name, setName] = useState(defaultValues?.name || "");
  const [email, setEmail] = useState(defaultValues?.email || "");
  const [contact, setContact] = useState(defaultValues?.contact || "");

  useEffect(() => {
    onChange({ name, email, contact });
  }, [name, email, contact, onChange]);

  return (
    <div>
      <h2>Personal Information</h2>
      <label>
        Name
        <input type="text" value={name} onChange={e => setName(e.target.value)} required />
      </label>
      <label>
        Email
        <input type="email" value={email} onChange={e => setEmail(e.target.value)} required />
      </label>
      <label>
        Contact Number
        <input type="tel" value={contact} onChange={e => setContact(e.target.value)} />
      </label>
    </div>
  );
}
