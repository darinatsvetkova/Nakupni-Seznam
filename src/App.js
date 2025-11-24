import { BrowserRouter as Router, Routes, Route, Link, useParams, useNavigate } from "react-router-dom";
import { useState } from "react";
import './App.css';


const prihlasenyUzivatel = "Alice";

let inicialniSeznamy = [
  {
    id: 1,
    nazev: "Seznam Lidl",
    vlastnik: "Alice",
    clenove: ["Alice", "Bob", "Carol"],
    polozky: [
      { id: 1, nazev: "Mléko", vyrieseno: false },
      { id: 2, nazev: "Chleba", vyrieseno: true },
    ],
    archivovany: false,
  },
  {
    id: 2,
    nazev: "Seznam Tesco",
    vlastnik: "Bob",
    clenove: ["Bob", "Alice", "David"],
    polozky: [
      { id: 1, nazev: "Máslo", vyrieseno: false },
      { id: 2, nazev: "Sýr", vyrieseno: false },
    ],
    archivovany: false,
  },
];


const ramecekStyl = {
  border: "1px solid #ddd",
  borderRadius: "8px",
  padding: "15px",
  backgroundColor: "#f9f9f9",
  boxShadow: "0 2px 5px rgba(0,0,0,0.05)",
  marginBottom: "15px"
};

const itemStyl = {
  backgroundColor: "#ffe6f0", 
  padding: "10px",
  marginBottom: "10px",
  borderRadius: "8px",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  boxShadow: "0 1px 3px rgba(0,0,0,0.1)"
};


function App() {
  const [seznamy, setSeznamy] = useState(inicialniSeznamy);
  const [zobrazitArchiv, setZobrazitArchiv] = useState(false);

  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={
            <HomePage
              seznamy={seznamy}
              setSeznamy={setSeznamy}
              zobrazitArchiv={zobrazitArchiv}
              setZobrazitArchiv={setZobrazitArchiv}
            />
          }
        />
        <Route
          path="/seznam/:id"
          element={<DetailPage seznamy={seznamy} setSeznamy={setSeznamy} />}
        />
        <Route
          path="/members/:id"
          element={<ManageMembers seznamy={seznamy} setSeznamy={setSeznamy} />}
        />
      </Routes>
    </Router>
  );
}


function HomePage({ seznamy, setSeznamy, zobrazitArchiv, setZobrazitArchiv }) {
  const dostupneSeznamy = seznamy.filter(
    (s) =>
      (s.vlastnik === prihlasenyUzivatel || s.clenove.includes(prihlasenyUzivatel)) &&
      s.archivovany === zobrazitArchiv
  );

  const pridatNovySeznam = () => {
    const nazev = prompt("Zadej název nového seznamu:");
    if (!nazev) return;
    const noveId = seznamy.length + 1;
    const novy = {
      id: noveId,
      nazev,
      vlastnik: prihlasenyUzivatel,
      clenove: [prihlasenyUzivatel],
      polozky: [],
      archivovany: false,
    };
    setSeznamy([...seznamy, novy]);
  };

  const smazatSeznam = (id) => {
    setSeznamy(seznamy.filter((s) => s.id !== id));
  };

  const archivovatSeznam = (id) => {
    setSeznamy(
      seznamy.map((s) => (s.id === id ? { ...s, archivovany: true } : s))
    );
  };

  return (
    <div className="container">
      <div className="top-bar">
        <div className="user-box">{prihlasenyUzivatel}</div>
        <button className="button">Odhlásit se</button>
      </div>

      <h1>My shopping lists</h1>

      <div className="controls">
        {!zobrazitArchiv && <button className="button" onClick={pridatNovySeznam}>Create new list</button>}
        <button className="button" onClick={() => setZobrazitArchiv(!zobrazitArchiv)}>
          {zobrazitArchiv ? "Show active lists" : "Show archived lists"}
        </button>
      </div>

      <div className="list-grid">
        {dostupneSeznamy.map((s) => (
          <div key={s.id} style={ramecekStyl}>
            <div className="list-header">
              <strong className="list-name">{s.nazev}</strong>
            </div>
            <p><strong>Owner:</strong> {s.vlastnik}</p>
            <div className="list-buttons">
              <Link to={`/seznam/${s.id}`}><button className="button">Open</button></Link>
              {!zobrazitArchiv && s.vlastnik === prihlasenyUzivatel && (
                <button className="button" onClick={() => archivovatSeznam(s.id)}>Archive</button>
              )}
              {s.vlastnik === prihlasenyUzivatel && (
                <button className="button" onClick={() => smazatSeznam(s.id)}>Delete</button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}


function DetailPage({ seznamy, setSeznamy }) {
  const { id } = useParams();
  const seznam = seznamy.find((s) => s.id === parseInt(id));
  const [filterNevyriesene, setFilterNevyriesene] = useState(true);
  const navigate = useNavigate();

  if (!seznam) return <p>Seznam nenalezen</p>;

  const pridatPolozku = () => {
    const nazev = prompt("Název nové položky:");
    if (!nazev) return;
    const noveId = seznam.polozky.length + 1;
    const novaPolozka = { id: noveId, nazev, vyrieseno: false };
    setSeznamy(
      seznamy.map((s) =>
        s.id === seznam.id ? { ...s, polozky: [...s.polozky, novaPolozka] } : s
      )
    );
  };

  const smazatPolozku = (polozkaId) => {
    setSeznamy(
      seznamy.map((s) =>
        s.id === seznam.id
          ? { ...s, polozky: s.polozky.filter((p) => p.id !== polozkaId) }
          : s
      )
    );
  };

  const toggleVyrieseno = (polozkaId) => {
    setSeznamy(
      seznamy.map((s) =>
        s.id === seznam.id
          ? {
              ...s,
              polozky: s.polozky.map((p) =>
                p.id === polozkaId ? { ...p, vyrieseno: !p.vyrieseno } : p
              ),
            }
          : s
      )
    );
  };

  const completePolozku = (polozkaId) => {
    setSeznamy(
      seznamy.map((s) =>
        s.id === seznam.id
          ? {
              ...s,
              polozky: s.polozky.map((p) =>
                p.id === polozkaId ? { ...p, vyrieseno: true } : p
              ),
            }
          : s
      )
    );
  };

  const zmenNazev = (novyNazev) => {
    setSeznamy(
      seznamy.map((s) =>
        s.id === seznam.id ? { ...s, nazev: novyNazev } : s
      )
    );
  };

  return (
    <div className="container">
      <button className="button back-btn" onClick={() => navigate("/")}>← Back to lists</button>

      <div style={{...ramecekStyl, display: 'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'20px'}}>
        <h1 style={{margin:0, fontSize:'1.8em'}}>{seznam.nazev}</h1>
        {seznam.vlastnik === prihlasenyUzivatel && (
          <button className="button" onClick={() => {
            const novyNazev = prompt("Zadej nový název seznamu:", seznam.nazev);
            if (novyNazev) zmenNazev(novyNazev);
          }}>Rename</button>
        )}
      </div>

      {/* Members */}
      <div style={{...ramecekStyl, marginBottom:'20px'}}>
        <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
          <h2>Members</h2>
          {seznam.vlastnik === prihlasenyUzivatel && (
            <Link to={`/members/${seznam.id}`}><button className="button">Manage</button></Link>
          )}
        </div>
        <ul>
          {seznam.clenove.map(c => (
            <li key={c}>
              {c} {c === seznam.vlastnik && "(Owner)"}
            </li>
          ))}
        </ul>

        {/* Leave button pro členy (jen pokud nejsem owner) */}
        {seznam.clenove.includes(prihlasenyUzivatel) && seznam.vlastnik !== prihlasenyUzivatel && (
          <button
            className="button"
            onClick={() => {
              if (window.confirm("Opravdu chceš odejít z tohoto seznamu?")) {
                setSeznamy(
                  seznamy.map((s) =>
                    s.id === seznam.id
                      ? { ...s, clenove: s.clenove.filter((cl) => cl !== prihlasenyUzivatel) }
                      : s
                  )
                );
                navigate("/");
              }
            }}
          >
            Leave the shopping list
          </button>
        )}
      </div>

      {/* Items */}
      <div style={ramecekStyl}>
        <label className="checkbox-label">
          <input type="checkbox" checked={!filterNevyriesene} onChange={() => setFilterNevyriesene(!filterNevyriesene)} />
          Show completed items
        </label>
        <ul className="items-list">
          {seznam.polozky
            .filter(p => !filterNevyriesene || !p.vyrieseno)
            .map(p => (
              <li key={p.id} style={itemStyl}>
                <span>
                  <input type="checkbox" checked={p.vyrieseno} onChange={() => toggleVyrieseno(p.id)} />
                  {p.nazev}
                </span>
                <div>
                  <button className="button" onClick={() => completePolozku(p.id)}>Complete</button>
                  <button className="button" onClick={() => smazatPolozku(p.id)}>Delete</button>
                </div>
              </li>
            ))}
        </ul>
        <button className="button" onClick={pridatPolozku}>+ Add item</button>
      </div>
    </div>
  );
}


function ManageMembers({ seznamy, setSeznamy }) {
  const { id } = useParams();
  const seznam = seznamy.find(s => s.id === parseInt(id));
  const navigate = useNavigate();

  if (!seznam) return <p>Seznam nenalezen</p>;

  const pridatClena = () => {
    const jmeno = prompt("Zadej jméno nového člena:");
    if (!jmeno) return;
    if (!seznam.clenove.includes(jmeno)) {
      setSeznamy(
        seznamy.map(s =>
          s.id === seznam.id ? { ...s, clenove: [...s.clenove, jmeno] } : s
        )
      );
    } else alert("Uživatel již je členem seznamu!");
  };

  const odebratClena = (c) => {
    setSeznamy(
      seznamy.map(s =>
        s.id === seznam.id ? { ...s, clenove: s.clenove.filter(cl => cl !== c) } : s
      )
    );
  };

  return (
    <div className="container">
      <button className="button back-btn" onClick={() => navigate(-1)}>← Back</button>
      <h1>Members of the shopping list</h1>

      <div className="list-grid">
        {seznam.clenove.map(c => (
          <div key={c} style={ramecekStyl}>
            <p><strong>Name:</strong> {c}</p>
            <p><strong>Role:</strong> {c === seznam.vlastnik ? <u>Owner</u> : "Member"}</p>
            {c !== seznam.vlastnik && <button className="button" onClick={() => odebratClena(c)}>Remove</button>}
          </div>
        ))}
      </div>
      <button className="button" onClick={pridatClena}>+ Add member</button>
    </div>
  );
}

export default App;
