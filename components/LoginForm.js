'use client';

import { useState, useReducer, useRef, useEffect, useCallback } from 'react';
import { Button, Form, Input, Radio, Typography, Row, Col, AutoComplete, message, Spin, Card } from 'antd';
import axios from 'axios';
import { useSocket } from '../contexts/SocketContext';
import { useUser } from '../contexts/UserContext'; // Importer le contexte utilisateur
import styles from "@/styles/login.module.css";
import { useRouter } from 'next/navigation';

const { Text } = Typography;

const initialState = {
    loading: false,
    results: [],
    value: '',
};

const genders = [
    {
        key: 'man',
        label: 'Homme',
    },
    {
        key: 'woman',
        label: 'Femme',
    }
];

function searchReducer(state, action) {
    switch (action.type) {
        case 'CLEAN_QUERY':
            return initialState;
        case 'START_SEARCH':
            return { ...state, loading: true, value: action.query };
        case 'FINISH_SEARCH':
            return { ...state, loading: false, results: action.results };
        case 'UPDATE_SELECTION':
            return { ...state, value: action.selection };
        default:
            throw new Error();
    }
}

const Login = () => {
    const socket = useSocket();
    const { setUser, login } = useUser(); // Utiliser le contexte utilisateur

    const [fields, setFields] = useState({
        gender: 'man',
        nickname: '',
        age: 18,
        city: {
            name: '',
            code: '',
        }
    });

    const [errors, setErrors] = useState({});
    const [state, dispatch] = useReducer(searchReducer, initialState);
    const { loading, results, value } = state;
    const timeoutRef = useRef();
    const router = useRouter();

    const handleSubmit = () => {
        if (!handleValidation()) {
            return;
        }

        socket.emit('login', fields);

        socket.on('logged', ({ user, token }) => {
            login(user, token);
        });
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFields({ ...fields, [name]: value });
    };

    const handleValidation = () => {
        let errors = {};

        if (!fields["nickname"]) {
            errors["nickname"] = "Ce champ est obligatoire";
        }

        if (fields["nickname"] && fields["nickname"].length < 3) {
            errors["nickname"] = "Le pseudo doit contenir au moins 3 caractères";
        }

        if (!fields["age"]) {
            errors["age"] = "Ce champ est obligatoire";
        }

        if (fields["age"] && (parseInt(fields["age"]) < 13 || parseInt(fields["age"]) > 99)) {
            errors["age"] = "L'âge doit être compris entre 13 et 99 ans";
        }

        if (!fields["city"]) {
            errors["city"] = "Ce champ est obligatoire";
        }

        setErrors(errors);

        return canSubmit(errors);
    };

    const canSubmit = (errors) => {
        return Object.keys(errors).length === 0;
    };

    const handleSearchChange = useCallback((value) => {
        clearTimeout(timeoutRef.current);
        dispatch({ type: 'START_SEARCH', query: value });

        timeoutRef.current = setTimeout(async () => {
            if (value.length === 0) {
                dispatch({ type: 'CLEAN_QUERY' });
                return;
            }

            try {
                const response = await axios.get(`https://api-adresse.data.gouv.fr/search/?q=${value}&type=municipality`);
                const options = response.data.features.map(feature => ({
                    value: feature.properties.label,
                    citycode: feature.properties.citycode,
                }));
                dispatch({ type: 'FINISH_SEARCH', results: options });
            } catch (error) {
                console.error("Error fetching city data:", error);
            }
        }, 300);
    }, []);

    useEffect(() => {
        return () => {
            clearTimeout(timeoutRef.current);
        }
    }, []);

    const handleResultSelect = (value, option) => {
        dispatch({ type: 'UPDATE_SELECTION', selection: value });
        setFields({ ...fields, city: { name: value, code: option.citycode } });
    };

    return (

        <Card className={styles.loginCard} id='login-form'>
            <Form layout="vertical" onFinish={handleSubmit}>
                <Form.Item label="Genre">
                    <Radio.Group onChange={handleChange} value={fields.gender} defaultValue={'man'} name="gender">
                        {genders.map(gender => (
                            <Radio key={gender.key} value={gender.key}>
                                {gender.label}
                            </Radio>
                        ))}
                    </Radio.Group>
                </Form.Item>

                <Form.Item label="Pseudo" validateStatus={errors["nickname"] ? 'error' : ''} help={errors["nickname"]}>
                    <Input name="nickname" value={fields.nickname} onChange={handleChange} placeholder='Pseudo' size='large' />
                </Form.Item>

                <Form.Item label="Age" validateStatus={errors["age"] ? 'error' : ''} help={errors["age"]}>
                    <Input name="age" value={fields.age} onChange={handleChange} placeholder='Age' type='number' size='large' />
                </Form.Item>

                <Form.Item label="Ville" validateStatus={errors["city"] ? 'error' : ''} help={errors["city"]}>
                    <AutoComplete
                        value={value}
                        options={results}
                        size='large'
                        onSearch={handleSearchChange}
                        onSelect={handleResultSelect}
                        placeholder="Rechercher une ville"
                        notFoundContent={loading ? <Spin size="small" /> : null}
                    />
                </Form.Item>

                <Form.Item>
                    <Button type="primary" htmlType="submit" block size="large">
                        Connexion
                    </Button>
                </Form.Item>
            </Form>
        </Card>

    );
};

export default Login;
