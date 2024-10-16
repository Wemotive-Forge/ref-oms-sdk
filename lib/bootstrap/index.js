import roles from './roles';
import superAdminUsers from './super-admin-users';
import {Role, User, UserRole} from '../../models';
import {SYSTEM_ROLES} from '../../utils/constants';
import {asyncForEach} from '../../utils/utilityFunctions';
import bcrypt from "bcryptjs"

async function BootstrapData() {
    // create roles
    try {
        await Role.bulkCreate([...roles.map((role) => {
            return {name: role}
        })])
    } catch (err) {
    }

    // create super admin users
    try {
        console.log('Creating super admin users...')
        const role = await Role.findOne({
            name: SYSTEM_ROLES.SUPER_ADMIN
        })
        await asyncForEach(superAdminUsers, async (sa) => {
            try {
                sa.password = await bcrypt.hash(sa.password, 10);
                const user = await User.create(sa)
                await UserRole.create({
                    UserId: user.id,
                    RoleId: role.id,
                })
            } catch (err) {
            }
        })
    } catch (err) {
       
    }
}

export default BootstrapData;