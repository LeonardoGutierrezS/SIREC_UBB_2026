import { useState, useEffect } from 'react';
import { getUsers } from '@services/user.service.js';

const useUsers = () => {
    const [users, setUsers] = useState([]);

    const fetchUsers = async () => {
        try {
            const response = await getUsers();
            // Los datos ya vienen formateados del servicio
            dataLogged(response);
            setUsers(response);
        } catch (error) {
            console.error("Error: ", error);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const dataLogged = (users) => {
        try {
            const { rut } = JSON.parse(localStorage.getItem('usuario'));
            const userIndex = users.findIndex(user => user.rut === rut);
            if(userIndex !== -1) {
                users.splice(userIndex, 1);
            }
        } catch (error) {
            console.error("Error: ", error)
        }
    };

    return { users, fetchUsers, setUsers };
};

export default useUsers;