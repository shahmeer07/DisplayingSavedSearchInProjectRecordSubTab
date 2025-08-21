/**
 * @NApiVersion 2.x
 * @NScriptType Suitelet
 */
define(["N/ui/serverWidget", "N/url", "N/record", "N/search"], function (serverWidget, url, record, search) {

    function onRequest(context) {
        try {
            var request = context.request;
        var response = context.response;

        var projectId = request.parameters.projectId || request.parameters.custpage_projectid
        log.debug("Project Id: ", projectId);

        var vendorFilter = request.parameters.custpage_vendor_filter || "";
        var itemFilter = request.parameters.custpage_item_filter || "";

        // Build form
        var form = serverWidget.createForm({
            title: "All Project PO Lines",
            hideNavBar: true
        });

        var hiddenProjectField = form.addField({
            id: "custpage_projectid",
            type: serverWidget.FieldType.TEXT,
            label: "Project ID (Hidden)"
        })

        hiddenProjectField.defaultValue = projectId
        hiddenProjectField.updateDisplayType({
            displayType: serverWidget.FieldDisplayType.HIDDEN
        })

        // Vendor filter field
        var vendorField = form.addField({
            id: "custpage_vendor_filter",
            type: serverWidget.FieldType.TEXT,
            label: "Vendor (Search by Name)"
        });
        vendorField.defaultValue = vendorFilter;

        // Item filter field
        var itemField = form.addField({
            id: "custpage_item_filter",
            type: serverWidget.FieldType.TEXT,
            label: "Item (Search by Item)"
        });
        itemField.defaultValue = itemFilter;

        form.addSubmitButton({ label: "Apply Filters" });

        // Sublist definition
        var sublist = form.addSublist({
            id: 'custpage_po_lines',
            type: serverWidget.SublistType.LIST,
            label: 'Open Purchase Orders'
        });

        sublist.addField({ id: 'action', label: 'Edit | View', type: serverWidget.FieldType.TEXT });
        sublist.addField({ id: 'status', label: 'Status', type: serverWidget.FieldType.TEXT });
        sublist.addField({ id: 'date', label: 'Date', type: serverWidget.FieldType.TEXT });
        sublist.addField({ id: 'duedate', label: 'Receive By', type: serverWidget.FieldType.TEXT });
        sublist.addField({ id: 'docnum', label: 'Document Number', type: serverWidget.FieldType.TEXT });
        sublist.addField({ id: 'vendor', label: 'Vendor', type: serverWidget.FieldType.TEXT });
        sublist.addField({ id: 'item', label: 'Item', type: serverWidget.FieldType.TEXT });
        sublist.addField({ id: 'quantity', label: 'Quantity', type: serverWidget.FieldType.FLOAT });
        sublist.addField({ id: 'qtyreceived', label: 'Quantity Fulfilled/Received', type: serverWidget.FieldType.FLOAT });
        sublist.addField({ id: 'amount', label: 'Amount', type: serverWidget.FieldType.CURRENCY });
        sublist.addField({ id: 'customer_display', label: 'Name', type: serverWidget.FieldType.TEXT });

        // Saved search
        var savedSearch = search.create({
            type: "purchaseorder",
            filters: [
                ["mainline", "is", "F"], "AND",
                ["status", "anyof", "PurchOrd:D", "PurchOrd:E", "PurchOrd:B", "PurchOrd:A"]
            ],
            columns: [
                search.createColumn({ name: "statusref", label: "Status" }),
                search.createColumn({ name: "trandate", label: "Date" }),
                search.createColumn({ name: "tranid", label: "Document Number" }),
                search.createColumn({ name: "entityid", join: 'vendor', label: "Vendor" }),
                search.createColumn({ name: "duedate", label: "Recieve By" }),
                search.createColumn({ name: "item", label: "Item" }),
                search.createColumn({ name: "quantity", label: "Quantiy" }),
                search.createColumn({ name: "quantityshiprecv", label: "Quantity Fulfilled/Recieved" }),
                search.createColumn({ name: "amount", label: "Amount" }),
                search.createColumn({ name: "altname", join: "job", label: "Project Name" }),
            ]
        });

        // Apply filters dynamically
        if (projectId) {
            savedSearch.filters = savedSearch.filters.concat([
                search.createFilter({
                    name: 'internalid',
                    join: 'job',
                    operator: search.Operator.ANYOF,
                    values: projectId
                })
            ]);
        }

        if (vendorFilter) {
            savedSearch.filters = savedSearch.filters.concat([
                search.createFilter({
                    name: 'entityid',
                    join: 'vendor',
                    operator: search.Operator.CONTAINS,
                    values: vendorFilter
                })
            ]);
        }

        if (itemFilter) {
            savedSearch.filters = savedSearch.filters.concat([
                search.createFilter({
                    name: 'itemid',
                    join: 'item',
                    operator: search.Operator.HASKEYWORDS,
                    values: itemFilter
                })
            ]);
        }

        log.debug("Saved search before running: ", savedSearch);

        var results = savedSearch.run().getRange({ start: 0, end: 1000 });
        log.debug("Saved search results: ", results);

        // Populate sublist
        for (var i = 0; i < results.length; i++) {
            var r = results[i];

            var status = r.getText('status') || r.getText('statusref') || 'N/A';
            var date = r.getValue('trandate') || '';
            var docnum = r.getValue('tranid') || '';
            var vendor = r.getValue({ name: 'entityid', join: 'vendor' }) || '';
            var duedate = r.getValue('duedate') || '';

            var item = r.getText('item');
            if (!item) {
                var itemVal = r.getValue('item');
                if (typeof itemVal === 'object' && itemVal !== null && itemVal.text) {
                    item = itemVal.text;
                } else {
                    item = String(itemVal || '');
                }
            }

            var quantity = r.getValue('quantity') || 0;
            var qtyReceived = r.getValue('quantityshiprecv') || 0;
            var amount = r.getValue('amount') || 0.00;

            var recordId = r.id;
            var viewUrl = url.resolveRecord({
                recordType: 'purchaseorder',
                recordId: recordId,
                isEditMode: false
            });

            var name = r.getValue({ name: 'altname', join: 'job' }) || 'N/A';

            var editUrl = url.resolveRecord({
                recordType: "purchaseorder",
                recordId: recordId,
                isEditMode: true
            });

            var actionHtml = '<a href="' + editUrl + '" target="_blank">Edit</a>' +
                             ' | ' +
                             '<a href="' + viewUrl + '" target="_blank">View</a>';

            sublist.setSublistValue({ id: 'status', line: i, value: String(status) });
            sublist.setSublistValue({ id: 'date', line: i, value: String(date) });
            sublist.setSublistValue({ id: 'docnum', line: i, value: String(docnum) });
            sublist.setSublistValue({ id: 'vendor', line: i, value: String(vendor) });
            sublist.setSublistValue({ id: 'duedate', line: i, value: duedate ? String(duedate) : " " });
            sublist.setSublistValue({ id: 'item', line: i, value: String(item) });
            sublist.setSublistValue({ id: 'quantity', line: i, value: String(quantity) });
            sublist.setSublistValue({ id: 'qtyreceived', line: i, value: String(qtyReceived) });
            sublist.setSublistValue({ id: 'amount', line: i, value: String(amount) });
            sublist.setSublistValue({ id: 'customer_display', line: i, value: String(name) });
            sublist.setSublistValue({ id: 'action', line: i, value: actionHtml });
        }

        response.writePage(form);
        } catch(error){
            log.error("Error in Suitelet onRequest function: ",error.message)

            form.addPageInitMessage({
                type: message.Type.ERROR,
                title: "Invalid Filters Used",
                message: "One or more filters caused the error: " + error.message
            })

        }
    }

    return {
        onRequest: onRequest
    };
});
