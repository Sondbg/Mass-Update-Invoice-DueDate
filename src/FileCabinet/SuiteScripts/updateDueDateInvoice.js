/**
 /**
 * @NApiVersion 2.1
 * @NScriptType MassUpdateScript
 */
define(['N/log', 'N/record', 'N/search', 'N/format'],
    /**
 * @param{log} log
 * @param{record} record
 * @param{search} search
 */
    (log, record, search, format) => {
        /**
         * Defines the Mass Update trigger point.
         * @param {Object} params
         * @param {string} params.type - Record type of the record being processed
         * @param {number} params.id - ID of the record being processed
         * @since 2016.1
         */
        const each = (params) => {

            try {

                var recordType = params.type;
                var recordID = params.id;

                var recordCurr = record.load({
                    type: recordType,
                    id: recordID,
                    isDynamic: false
                });

                var entityId = recordCurr.getValue({
                    fieldId: 'entity'
                });

                var termsID = search.lookupFields({
                    type: search.Type.CUSTOMER,
                    id: entityId,
                    columns: 'terms'
                });

                log.debug('terms ID',termsID)
                var termsValue = search.lookupFields({
                    type: search.Type.TERM,
                    id: termsID.terms[0].value,
                    columns: "daysuntilnetdue"
                });


                var invoiceDueDate = recordCurr.getValue({
                    fieldId: "trandate"
                });

                var parsedDate = format.parse(invoiceDueDate, format.Type.DATE);
                log.debug('currentDue Date', parsedDate);
                log.debug('get Date Parsed',parsedDate.getDate())
                parsedDate.setDate((parsedDate.getDate() + Number(termsValue.daysuntilnetdue)));

                log.debug('updated Date', parsedDate);

                recordCurr.setValue({
                    fieldId: "duedate",
                    value: parsedDate
                })

                recordCurr.save();

            } catch (err) {
                log.error('error mass update', err)
            }
        }

        return { each }

    });
