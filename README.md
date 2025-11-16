# 📦 SavedSearchInProjectRecordSubTab

### **NetSuite Suitelet + User Event Script**

![Banner](https://dummyimage.com/1100x220/1d1d1d/ffffff&text=Suitelet+For+Displaying+SavedSearch+in+a+Record's(Project)+subtab)

### **Displays All Project Purchase Order Lines Inside the Project Record**

---

## 🏷️ **Overview**

This repository contains a **Suitelet** and a **User Event Script** that together embed a full, filterable list of **all Purchase Order lines related to a Project** directly inside the Project record.

The enhancement adds a new tab *“All Project PO Lines”* via a User Event Script and loads an external Suitelet inside an iframe to show dynamically filtered results.

This functionality is ideal for project managers, procurement teams, and financial controllers who require **visibility into project‑specific PO activity** without navigating away from the Project record.

---

## 🚀 **Features**

### **Suitelet — PO Line Display (`@NScriptType Suitelet`)**

* Displays **all non‑mainline** PO item lines.
* Filters supported:

  * **Vendor** (text contains)
  * **Item** (keywords)
  * **Project** (internalid)
* Automatically loads PO lines connected to the Project record.
* Shows the following information:

  * Status
  * Date
  * Receive By
  * Document Number
  * Vendor
  * Item
  * Qty Ordered
  * Qty Received/Fulfilled
  * Amount
  * Project Name
* Provides **Edit** and **View** hyperlinks for every PO line.

### **User Event Script — Adds Tab + Iframe (`@NScriptType UserEventScript`)**

* On project record *View* mode, adds a new tab: **All Project PO Lines**.
* Injects an iframe that loads the Suitelet.
* Passes the current Project ID to the Suitelet automatically.

---

## 📁 **File Structure**

```
SavedSearchInProjectRecordSubTab/
│
├── suitelet_po_lines.js          # Main Suitelet (PO line search + UI)
├── ue_add_po_tab.js             # User Event Script (adds tab + iframe)
└── README.md                     # This file
```

---

## 🧠 **Technical Flow**

1. **User opens a Project** → User Event Script triggers.
2. A tab titled **All Project PO Lines** is added.
3. An iframe loads the Suitelet URL with `projectId` passed.
4. Suitelet builds a UI form with optional filters.
5. Executes a saved‑search‑like query for PO item lines.
6. Results populate a sublist displayed inside the tab.

---

## 📄 **Suitelet Summary**

The Suitelet:

* Builds the form and filter fields.
* Adds a rich list sublist.
* Performs a purchase order line search.
* Handles filtering logic elegantly.
* Safely renders PO line details and URLs.

Key entrypoint:

```js
return {
    onRequest: onRequest
};
```

---

## 📄 **User Event Summary**

The User Event:

* Runs only in **VIEW** mode.
* Resolves the Suitelet URL.
* Creates an iframe and embeds it into a custom tab.

Key entrypoint:

```js
return {
    beforeLoad: beforeLoad
};
```

---

## 🔧 **Deployment Notes**

### Required Deployments:

* **Suitelet Script** — must be deployed with an accessible external/internal URL.
* **User Event Script** — must be deployed on the **Project record (job)**.

### Parameters Required:

* Provide correct `scriptId` and `deploymentId` in the UE script when resolving URL.

---

## 📝 **Customization Notes**

* Increase Suitelet iframe height in the UE script if more rows are expected.
* Modify search filters to add more constraints such as subsidiary or location.
* Extend the sublist to display additional PO fields.

---

## 🛡️ **Error Handling**

The Suitelet contains structured try/catch logic that:

* Logs errors clearly.
* Returns user‑friendly messages when bad filters are applied.

---

## 🤝 **Contributions**

Pull requests, enhancements, and improvements are welcome!

---
