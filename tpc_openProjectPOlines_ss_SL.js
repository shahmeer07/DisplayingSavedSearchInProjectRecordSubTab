/**
 * @NApiVersion 2.x
 * @NScriptType Suitelet
 */
define(["N/ui/serverWidget", "N/url", "N/record","N/search"], function (serverWidget, url, record,search) {

    function onRequest(context) {
        var request = context.request;
        var response = context.response;

        var projectId = request.parameters.projectId;

        var form = serverWidget.createForm({
            title: "Open Project PO Lines",
            hideNavBar: true
        });

    //         var searchUrl = 'https://9343516-sb1.app.netsuite.com/app/common/search/searchresults.nl' +
    //     '?searchtype=Transaction' +
    //     '&searchid=1021' +
    //     '&filterid=entity' +
    //     '&operator=IS' +
    //     '&value=' + projectId +
    //     '&whence=';

    // var iframeHtml = '<iframe src="' + searchUrl + '" width="100%" height="800px" frameborder="0"></iframe>';

    //     form.addField({
    //         id: "custpage_project_ss_frame",
    //         type: serverWidget.FieldType.INLINEHTML,
    //         label: " "
    //     }).defaultValue = iframeHtml;

    //     response.writePage(form);

        var sublist = form.addSublist({
            id: 'custpage_po_lines',
            type: serverWidget.SublistType.LIST,
            label: 'Open Purchase Orders'
        });

        sublist.addField({
            id: 'action',
            label: 'Edit | View',
            type: serverWidget.FieldType.TEXT
        });

        sublist.addField({ id: 'status', label: 'Status', type: serverWidget.FieldType.TEXT });
        sublist.addField({ id: 'date', label: 'Date', type: serverWidget.FieldType.TEXT });
        sublist.addField({ id: 'docnum', label: 'Document Number', type: serverWidget.FieldType.TEXT });
        sublist.addField({ id: 'item', label: 'Item', type: serverWidget.FieldType.TEXT });
        sublist.addField({ id: 'quantity', label: 'Quantity', type: serverWidget.FieldType.INTEGER });
        sublist.addField({ id: 'qtyreceived', label: 'Quantity Fulfilled/Received', type: serverWidget.FieldType.INTEGER });
        sublist.addField({ id: 'amount', label: 'Amount', type: serverWidget.FieldType.CURRENCY });

        var savedSearch = search.load({ id: 'customsearch844' });

        var results = savedSearch.run().getRange({ start: 0, end: 1000 });

        log.debug("Saved search results: ",results)

        for (var i = 0; i < results.length; i++) {
            var r = results[i];
            
            var status = r.getText('status') || r.getText('statusref') || 'N/A';
            var date = r.getValue('trandate') || '';
            var docnum = r.getValue('tranid') || '';
            
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

            var editUrl = url.resolveRecord({
                recordType: "purchaseorder",
                recordId: recordId,
                isEditMode: true
            })

            var actionHtml = '<a  href="' + editUrl + '" target="_blank">Edit</a>'+ ' | ' + '<a href="' + viewUrl + '" target="_blank">View</a>' ;


            sublist.setSublistValue({ id: 'status', line: i, value: String(status) });
            sublist.setSublistValue({ id: 'date', line: i, value: String(date) });
            sublist.setSublistValue({ id: 'docnum', line: i, value: String(docnum) });
            sublist.setSublistValue({ id: 'item', line: i, value: String(item) });
            sublist.setSublistValue({ id: 'quantity', line: i, value: String(quantity) });
            sublist.setSublistValue({ id: 'qtyreceived', line: i, value: String(qtyReceived) });
            sublist.setSublistValue({ id: 'amount', line: i, value: String(amount) });
            sublist.setSublistValue({ id: 'action', line: i, value: actionHtml });
        }

        response.writePage(form);

    }

    return {
        onRequest: onRequest
    };
});
