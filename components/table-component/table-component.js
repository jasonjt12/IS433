class TableComponent extends HTMLElement {
  static get observedAttributes() { return ["subtitle", "variant"]; }

  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this._grid = null;
    this._ro = null;
    this._resizeTimer = null;
  }

  connectedCallback() { this.render(); }
  disconnectedCallback() {
    if (this._ro) this._ro.disconnect();
    window.removeEventListener("resize", this._onWinResize);
  }

  attributeChangedCallback(name, _, newValue) {
    this[name] = newValue;
    if (this.isConnected) this.render();
  }

  render() {
    const subtitle = this.getAttribute("subtitle") || "";
    const variant = this.getAttribute("variant") || "concepts";

    const datasets = {
      concepts: {
        columns: ["Concept", "Name", "Key Features"],
        data: [
          ["A", "Baseline Continuous-Rotation BLDC System", "Ungeared BLDC motor, magnetic encoder, external processing"],
          ["B", "Reciprocating Test Platform", "Geared BLDC motor, optical encoder, onboard processing, reciprocating motion"],
          ["C", "IMU Test Platform", "Brushed geared DC motor, IMU for angle, external processing"],
          ["D", "Compact and Integrated System", "Frameless BLDC motor, capacitive encoder, highly integrated, low weight"],
        ],
      },
      contacts: {
        columns: ["Name", "Email", "Phone Number"],
        data: [
          ["John", "john@example.com", "(353) 01 222 3333"],
          ["Mark", "mark@gmail.com", "(01) 22 888 4444"],
          ["Eoin", "eoin@gmail.com", "0097 22 654 00033"],
          ["Sarah", "sarahcdd@gmail.com", "+322 876 1233"],
          ["Afshin", "afshin@mail.com", "(353) 22 87 8356"],
        ],
      },
    };

    const { columns, data } = datasets[variant] || datasets.concepts;

    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
          width: 100%;
          max-width: var(--content-max-width, 800px); /* overridable */
          margin-inline: auto; /* center within page */
        }
        .table-wrapper { width: 100%; }
        .grid-container { width: 100%; max-width: 100%; overflow-x: auto; }

        /* Ensure Grid.js fills but never exceeds host */
        .gridjs-container, .gridjs-wrapper, .gridjs-table {
          width: 100% !important;
          max-width: 100% !important;
        }
        .gridjs-table { table-layout: fixed; border-collapse: collapse !important; }

        /* Center text and add gray borders */
        .gridjs-th, .gridjs-td {
          white-space: normal !important;
          word-break: break-word;
          overflow-wrap: anywhere;
          text-align: center;
          vertical-align: middle;
          border: 1px solid #ddd !important;
        }
        .gridjs-th-content {
          display: flex;
          justify-content: center;
          width: 100%;
        }

        /* Hide footer (summary/pagination) just in case */
        .gridjs-footer, .gridjs-bottom { display: none !important; }

        .subtitle { font-size: 0.95rem; font-style: italic; color: #666; margin-top: 8px; text-align: center; }
      </style>
      <div class="table-wrapper">
        <div class="grid-container"></div>
        ${subtitle ? `<div class="subtitle">${subtitle}</div>` : ""}
      </div>
    `;

    const container = this.shadowRoot.querySelector(".grid-container");

    const init = () => {
      if (!window.gridjs) return false;
      this._grid = new window.gridjs.Grid({
        columns,
        data,
        sort: false,
        search: false,
        pagination: false
      });
      this._grid.render(container);

      if (!this._ro) {
        this._ro = new ResizeObserver(() => {
          clearTimeout(this._resizeTimer);
          this._resizeTimer = setTimeout(() => {
            if (this._grid && this.isConnected) this._grid.updateConfig({}).forceRender();
          }, 80);
        });
        this._ro.observe(container);
      }

      this._onWinResize = () => {
        clearTimeout(this._resizeTimer);
        this._resizeTimer = setTimeout(() => {
          if (this._grid && this.isConnected) this._grid.updateConfig({}).forceRender();
        }, 80);
      };
      window.addEventListener("resize", this._onWinResize);

      return true;
    };

    if (!init()) {
      const iv = setInterval(() => { if (init()) clearInterval(iv); }, 50);
      setTimeout(() => clearInterval(iv), 5000);
    }
  }
}
customElements.define("table-component", TableComponent);
