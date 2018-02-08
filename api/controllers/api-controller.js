'use strict';

// eslint-disable-next-line prefer-destructuring
const OracleAccelerator = require('lilly-api-oracle-accelerator').api_accelerator.OracleAccelerator;

// replace the query below with your query.  Use %1, %2, %3 as variable place holders.
const sql = 'SELECT TABLE_NAME, COMMENTS FROM DICT ';

/*
 * create a property map to map table column names to JSON property names.
 * leave recordIndex unless it is in your query then modify that property and the rowNumAlias value.
 */
 const propMap = {
     tableName: 'TABLE_NAME',
     comments: 'COMMENTS',
     recordIndex: 'recordIndex'
 };

 const rowNumAlias = 'recordIndex';

// function to get out data
var get = function (req, res) {
    if(req!=null){
        var oa = new OracleAccelerator(req, propMap, req.swagger.params.page_limit.value, sql, rowNumAlias);
        var queryParameters = [];

        /*
         * setup query where clause parameters array if needed.
         * example of how to read them based off of swagger definition:
         * queryParameters[0] = req.swagger.params.my_param.value;  (replacement variable for %1)
         */
        oa.executeQuery(queryParameters, res);
    }
};

/*
 * just a stub function to satisfy swagger.
 * Never called in code.
 * This is wired up by the accelerator.
 */
/* istanbul ignore next */
var options = function() {
    return;
}

module.exports={ get, options};
