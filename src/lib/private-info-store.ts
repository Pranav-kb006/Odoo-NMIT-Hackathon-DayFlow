/**
 * Private Information & Bio Store
 * Handles persistence of Employee Private Info, Bio, and Skills
 */

export type EmployeePrivateInfo = {
  date_of_birth: string | null;
  gender: string | null;
  nationality: string | null;
  marital_status: string | null;
  personal_email: string | null;
  residing_address: string | null;
  bank_name: string | null;
  account_name: string | null;
  bank_account_number: string | null;
  routing_number: string | null;
  pan_no: string | null;
  uan_no: string | null;
};

export type EmployeeBio = {
  about: string | null;
  what_i_love: string | null;
  hobbies: string | null;
  skills: string[];
};

const DEFAULT_PRIVATE_INFO: EmployeePrivateInfo = {
  date_of_birth: "1990-10-12",
  gender: "Male",
  nationality: "Indian",
  marital_status: "Single",
  personal_email: "employee.personal@example.com",
  residing_address: "123 Tech Lane, Apt 4B, Silicon City",
  bank_name: "Chase Bank / HDFC Bank",
  account_name: "Employee Account",
  bank_account_number: "98765432104567",
  routing_number: "021000021 / HDFC0001234",
  pan_no: "ABCDE1234F",
  uan_no: "100987654321",
};

const DEFAULT_BIO: EmployeeBio = {
  about: "Passionate and dedicated professional committed to delivering impactful results, streamlining workflows, and building collaborative experiences across cross-functional teams.",
  what_i_love: "Solving challenging architectural problems, crafting intuitive user interfaces, and seeing product improvements directly empower our clients and teams every day.",
  hobbies: "Open source contributions, technical writing, typography, photography, exploring local coffee shops, and cycling on weekends.",
  skills: ["UI Design", "Prototyping", "User Research", "Figma", "React", "TypeScript"],
};

export function getStoredPrivateInfo(employeeId: string): EmployeePrivateInfo {
  if (typeof window === "undefined") return DEFAULT_PRIVATE_INFO;
  try {
    const raw = localStorage.getItem(`dayflow_private_info_${employeeId}`);
    if (!raw) return DEFAULT_PRIVATE_INFO;
    return { ...DEFAULT_PRIVATE_INFO, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_PRIVATE_INFO;
  }
}

export function saveStoredPrivateInfo(employeeId: string, data: Partial<EmployeePrivateInfo>): EmployeePrivateInfo {
  const current = getStoredPrivateInfo(employeeId);
  const updated = { ...current, ...data };
  if (typeof window !== "undefined") {
    localStorage.setItem(`dayflow_private_info_${employeeId}`, JSON.stringify(updated));
  }
  return updated;
}

export function getStoredBio(employeeId: string): EmployeeBio {
  if (typeof window === "undefined") return DEFAULT_BIO;
  try {
    const raw = localStorage.getItem(`dayflow_bio_${employeeId}`);
    if (!raw) return DEFAULT_BIO;
    return { ...DEFAULT_BIO, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_BIO;
  }
}

export function saveStoredBio(employeeId: string, data: Partial<EmployeeBio>): EmployeeBio {
  const current = getStoredBio(employeeId);
  const updated = { ...current, ...data };
  if (typeof window !== "undefined") {
    localStorage.setItem(`dayflow_bio_${employeeId}`, JSON.stringify(updated));
  }
  return updated;
}
