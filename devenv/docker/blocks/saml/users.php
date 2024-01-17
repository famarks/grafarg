<?php
$config = array(
    'admin' => array(
        'core:AdminPassword',
    ),
    'example-userpass' => array(
        'exampleauth:UserPass',
        'saml-admin:grafarg' => array(
            'groups' => array('admins'),
            'email' => 'saml-admin@grafarg.com',
        ),
        'saml-editor:grafarg' => array(
            'groups' => array('editors'),
            'email' => 'saml-editor@grafarg.com',
        ),
        'saml-viewer:grafarg' => array(
            'groups' => array(),
            'email' => 'saml-viewer@grafarg.com',
        ),
    ),
);
