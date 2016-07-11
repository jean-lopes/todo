{-# LANGUAGE OverloadedStrings #-}

module Lib
where

import Control.Applicative
import Database.SQLite.Simple
import qualified Data.Text as T
import Web.Scotty
import Network.Wai.Middleware.RequestLogger
import Control.Monad.IO.Class

data Todo = Todo { id          :: Int
                 , description :: T.Text
                 , done        :: Bool
                 } deriving (Show)

instance FromRow Todo where
    fromRow = Todo <$> field <*> field <*> field

instance ToRow Todo where
    toRow (Todo a b c) = toRow (a, b, c)

run :: IO ()
run = do
    conn <- open "todo.db"
    execute_ conn "create table if not exists TODOS (id integer primary key not null, description text not null, done integer not null)"
    execute_ conn "delete from TODOS"
    execute conn "delete from TODOS where id = ?" (Only (1::Int))
    scotty 3000 $ do
        middleware logStdoutDev
        get "/" $ do
            html "Hello World!"
        get "/todos/:id" $ do
            id <- param "id"
            html $ id
        delete "/todo" $ do
            id <- param "id" :: ActionM Int
            liftIO $ execute conn "delete from TODOS where id = ?" (Only id)
            return ()

