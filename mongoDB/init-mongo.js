db.createUser({
  user: 'nick',
  pwd: '1234',
  roles: [{
    role: 'readWrite',
    db: 'Vehicle'
  }]
})
