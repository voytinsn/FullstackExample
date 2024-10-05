import { AdUser } from "../types";

interface Params {
  adUser: AdUser;
  deleteCallback: (adUser: AdUser) => void;
}

export default function AdUserRow({ adUser, deleteCallback }: Params) {
  return (
    <div className="mb-1">
      <button
        className="btn btn-sm btn-outline-secondary"
        onClick={() => deleteCallback(adUser)}
      >
        <i className="bi bi-trash"></i>
      </button>
      <span className="ms-2">{`${adUser.samAccountName} (${adUser.name})`}</span>
    </div>
  );
}
