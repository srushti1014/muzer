"use client"
import HomeView from '@/components/HomeView'
import { useSession } from 'next-auth/react'
import React from 'react'

const Home = () => {
    const { data: session, status } = useSession()

    if (status === "loading") return <p>Loading...</p>;

    if (!session?.user.id) {
        return <h1>Please Log in....</h1>;
    }
    return (
        <div>
            <HomeView></HomeView>
        </div>
    )
}

export default Home;
