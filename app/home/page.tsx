"use client"
import HomeView from '@/components/HomeView'
import Loader from '@/components/Loader'
import { useSession } from 'next-auth/react'
import React from 'react'

const Home = () => {
    const { data: session, status } = useSession()

    if (status === "loading") return <Loader />;

    if (!session?.user.id) {
        return <h1>Please Log in....</h1>;
    }
    return (
         <HomeView></HomeView>
    )
}

export default Home;
