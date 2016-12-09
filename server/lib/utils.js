module.exports = {

  sendErrorResponse: function(res, code, msg, endResp) {
    console.error(code + ': ' + msg);

    if (res) {
      if (res.headersSent)
      {
        console.error('Header already gone, skipping response to client');
        return;
      }

      res.status(code);
      res.json({'error': msg});

      // End the response by default
      if (endResp !=='undefined' && endResp == true)
        res.end();

    } else {
      console.error('Cannot access res');
    }

    return res;
  }

}
