import User from '../models/users.server.model';
import userAuthCtrl from '../controllers/users-authentication.server.controller';
import userCtrl from '../controllers/users.server.controller';
import passportConfig from '../config/users.server.passport';
import env from 'node-env-file';

//if (!process.env.ADMIN_REG_ACCESS_HASH || !process.env.ADMIN_REG_ACCESS_SALT){
  env(`${__dirname} /../../../../.env`);
//}

const usersRoutes = (app) => {

  app.route('/api/users/register/')
    .post(userAuthCtrl.register);

  app.route('/api/users/login/')
    .post(userAuthCtrl.login);

  app.route('/api/users/allow-admin-registration')
    .post(userAuthCtrl.allowAdminRegistration);

  app.route('/api/users')
    .get(userCtrl.list);

  app.route('/api/users/:userID')
    .get(userCtrl.listOne)
    .put(userCtrl.updateOne);

  app.route('/api/users/group/:groupHandle')
    .get(userCtrl.listByGroup);

  app.route('/api/users/group-adminstrators/:groupAdminsID')
    .get(userCtrl.listByGroupAdminstrators);

  app.route('/api/users/group-pending-members/:groupPendingMembersID')
    .get(userCtrl.listByGroupPendingMembers);

  app.route('/api/users/:userID/join-group/:groupHandle')
    .put(userCtrl.joinGroup);

  app.route('/api/users/:userID/leave-group/:groupHandle')
    .put(userCtrl.leaveGroup);

};

export default usersRoutes;