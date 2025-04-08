/**
 * @NApiVersion 2.x
 * @NScriptType UserEventScript
 */

define (["N/ui/serverWidget" , "N/url","N/runtime"] , function (serverWidget,url,runtime) {

        function beforeLoad(context) {

            if(context.type !== context.UserEventType.VIEW){
                return
            }

            var form = context.form
            var projectId = context.newRecord.id 

            form.addTab({
                id: 'custpage_open_po_lines_tab',
                label: "Open PO Lines"
            })

            var Suitelet_URL = url.resolveScript({
                scriptId: "customscript_tpc_p_po_lines_ss_sl",
                deploymentId: "customdeploy_tpc_p_po_lines_ss_sl_dep",
                params: {
                    projectId : projectId
                }
            })

            var iframeHtml = '<iframe src="' + Suitelet_URL +
            '" width="100%" height="800px" frameborder="0"></iframe>';


            form.addField({
                id: 'custpage_iframe_po_search',
            type: serverWidget.FieldType.INLINEHTML,
            label: 'PO Search Frame',
            container: 'custpage_open_po_lines_tab'
      
            }). defaultValue = iframeHtml

        }
        return {
            beforeLoad : beforeLoad
        }

})